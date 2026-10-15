import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../server/index.js';

const TOKEN = 'test-token';
let tmpDir;
let wsDir;
let app;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gwc-api-'));
  wsDir = path.join(tmpDir, 'project-a');
  await fs.mkdir(wsDir);
  ({ app } = await buildApp({ dataDir: tmpDir, token: TOKEN }));
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const headers = { 'x-auth-token': TOKEN };

describe('鉴权', () => {
  it('缺少令牌返回 403 UNAUTHORIZED', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/workspaces' });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ ok: false, error: { code: 'UNAUTHORIZED' } });
  });

  it('支持 ?token= 查询参数鉴权', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/workspaces?token=${TOKEN}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });
});

describe('工作区接口', () => {
  let workspaceId;

  it('POST /api/workspaces 添加目录返回 201', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      headers,
      payload: { path: wsDir },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.data.path).toBe(wsDir);
    workspaceId = body.data.id;
  });

  it('POST 不存在的目录返回 400 INVALID_PARAM', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/workspaces',
      headers,
      payload: { path: path.join(tmpDir, 'no-such-dir') },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ ok: false, error: { code: 'INVALID_PARAM' } });
  });

  it('POST 缺少 path 返回 400 INVALID_PARAM', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/workspaces', headers, payload: {} });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ ok: false, error: { code: 'INVALID_PARAM' } });
  });

  it('GET /api/workspaces 返回已添加的工作区', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/workspaces', headers });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe(workspaceId);
  });

  it('DELETE /api/workspaces/:id 删除工作区', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/workspaces/${workspaceId}`,
      headers,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);

    const list = await app.inject({ method: 'GET', url: '/api/workspaces', headers });
    expect(list.json().data).toHaveLength(0);
  });

  it('DELETE 不存在的 id 返回 404 WORKSPACE_NOT_FOUND', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/workspaces/no-such-id',
      headers,
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ ok: false, error: { code: 'WORKSPACE_NOT_FOUND' } });
  });
});

describe('终端会话接口', () => {
  it('POST 未知 workspaceId 返回 404 WORKSPACE_NOT_FOUND', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/terminal-sessions',
      headers,
      payload: { workspaceId: 'no-such-workspace' },
    });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ ok: false, error: { code: 'WORKSPACE_NOT_FOUND' } });
  });

  it('GET /api/terminal-sessions 返回会话列表', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/terminal-sessions', headers });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, data: [] });
  });
});
