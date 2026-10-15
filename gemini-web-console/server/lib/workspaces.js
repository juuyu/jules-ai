import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AppError } from './errors.js';
import { readJson, writeJson } from './json-file.js';

export function createWorkspaceStore(dataFile) {
  let items = [];
  let loaded = false;

  async function load() {
    const data = await readJson(dataFile, { workspaces: [] });
    items = Array.isArray(data.workspaces) ? data.workspaces : [];
    loaded = true;
  }

  async function save() {
    await writeJson(dataFile, { workspaces: items });
  }

  return {
    async list() {
      if (!loaded) await load();
      return [...items];
    },

    async add(inputPath) {
      if (!loaded) await load();
      const abs = path.resolve(inputPath);
      const stat = await fs.stat(abs).catch(() => null);
      if (!stat?.isDirectory()) {
        throw new AppError('INVALID_PARAM', `目录不存在：${abs}`);
      }
      const existing = items.find((item) => item.path === abs);
      if (existing) return existing;
      const workspace = {
        id: randomUUID(),
        name: path.basename(abs) || abs,
        path: abs,
        createdAt: new Date().toISOString(),
      };
      items.push(workspace);
      await save();
      return workspace;
    },

    async remove(id) {
      if (!loaded) await load();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) throw new AppError('WORKSPACE_NOT_FOUND', '工作区不存在');
      const [removed] = items.splice(index, 1);
      await save();
      return removed;
    },

    async resolve(id) {
      if (!loaded) await load();
      const workspace = items.find((item) => item.id === id);
      if (!workspace) throw new AppError('WORKSPACE_NOT_FOUND', '工作区不存在');
      return workspace;
    },
  };
}
