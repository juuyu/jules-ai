import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readJson, writeJson } from '../../server/lib/json-file.js';

let tmpDir;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gwc-json-'));
});

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('readJson', () => {
  it('文件不存在时返回 fallback', async () => {
    const file = path.join(tmpDir, 'missing.json');
    expect(await readJson(file, { workspaces: [] })).toEqual({ workspaces: [] });
  });

  it('内容不是合法 JSON 时返回 fallback', async () => {
    const file = path.join(tmpDir, 'broken.json');
    await fs.writeFile(file, '{ not json');
    expect(await readJson(file, null)).toBeNull();
  });
});

describe('writeJson', () => {
  it('写入后可读回，中文内容无损', async () => {
    const file = path.join(tmpDir, 'cn.json');
    const value = { name: '工作区：示例', tags: ['中文', '测试'] };
    await writeJson(file, value);
    expect(await readJson(file)).toEqual(value);
  });

  it('并发写入按调用顺序串行化，最终内容为最后一次写入', async () => {
    const file = path.join(tmpDir, 'concurrent.json');
    const writes = [];
    for (let i = 0; i < 5; i++) {
      writes.push(writeJson(file, { index: i }));
    }
    await Promise.all(writes);
    expect(await readJson(file)).toEqual({ index: 4 });
  });
});
