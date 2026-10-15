import { fail, ok } from '../lib/errors.js';

export function registerSessionRoutes(app, { workspaceStore, terminalManager }) {
  app.get('/api/terminal-sessions', async (request, reply) => {
    return ok(reply, terminalManager.list(request.query?.workspaceId));
  });

  app.post('/api/terminal-sessions', async (request, reply) => {
    const { workspaceId, cols, rows } = request.body ?? {};
    if (typeof workspaceId !== 'string' || !workspaceId) {
      return fail(reply, 400, 'INVALID_PARAM', '缺少 workspaceId');
    }
    const workspace = await workspaceStore.resolve(workspaceId);
    const sessionId = await terminalManager.create({ workspaceId, cwd: workspace.path, cols, rows });
    return ok(reply, { sessionId, workspaceId }, 201);
  });

  app.delete('/api/terminal-sessions/:id', async (request, reply) => {
    await terminalManager.kill(request.params.id);
    return ok(reply, { killed: request.params.id });
  });
}
