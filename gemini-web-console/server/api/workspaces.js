import { fail, ok } from '../lib/errors.js';

export function registerWorkspaceRoutes(app, { workspaceStore }) {
  app.get('/api/workspaces', async (request, reply) => {
    return ok(reply, await workspaceStore.list());
  });

  app.post('/api/workspaces', async (request, reply) => {
    const inputPath = request.body?.path;
    if (typeof inputPath !== 'string' || !inputPath.trim()) {
      return fail(reply, 400, 'INVALID_PARAM', '请提供目录路径');
    }
    const workspace = await workspaceStore.add(inputPath.trim());
    return ok(reply, workspace, 201);
  });

  app.delete('/api/workspaces/:id', async (request, reply) => {
    await workspaceStore.remove(request.params.id);
    return ok(reply, { removed: request.params.id });
  });
}
