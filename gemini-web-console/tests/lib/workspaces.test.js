import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createWorkspaceStore } from '../../server/lib/workspaces.js';

let tmpDir;
let wsDir;
let dataFile;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gwc-ws-'));
  wsDir = path.join(tmpDir, 'my-project');
  await fs.mkdir(wsDir);
  dataFile = path.join(tmpDir, 'workspaces.json');
});

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('createWorkspaceStore', () => {
  it('add 返回工作区并持久化，重复添加同一路径返回已有项', async () => {
    const store = createWorkspaceStore(dataFile);
    const first = await store.add(wsDir);
    expect(first.id).toBeTruthy();
    expect(first.name).toBe('my-project');
    expect(first.path).toBe(wsDir);

    const again = await store.add(wsDir);
    expect(again.id).toBe(first.id);
    expect(await store.list()).toHaveLength(1);
  });

  it('新实例可从同一数据文件恢复', async () => {
    const store = createWorkspaceStore(dataFile);
    const items = await store.list();
    expect(items).toHaveLength(1);
    expect(items[0].path).toBe(wsDir);
  });

  it('add 不存在的目录时抛出 INVALID_PARAM', async () => {
    const store = createWorkspaceStore(path.join(tmpDir, 'fresh.json'));
    await expect(store.add(path.join(tmpDir, 'no-such-dir'))).rejects.toMatchObject({
      code: 'INVALID_PARAM',
    });
  });

  it('resolve 返回对应工作区，remove 后不可再 resolve', async () => {
    const store = createWorkspaceStore(dataFile);
    const [workspace] = await store.list();
    expect((await store.resolve(workspace.id)).path).toBe(wsDir);

    await store.remove(workspace.id);
    expect(await store.list()).toHaveLength(0);
    await expect(store.resolve(workspace.id)).rejects.toMatchObject({
      code: 'WORKSPACE_NOT_FOUND',
    });
    await expect(store.remove(workspace.id)).rejects.toMatchObject({
      code: 'WORKSPACE_NOT_FOUND',
    });
  });
});
