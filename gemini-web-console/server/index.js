import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import { registerSessionRoutes } from './api/sessions.js';
import { registerWorkspaceRoutes } from './api/workspaces.js';
import { config, loadConfig } from './config.js';
import { AppError, fail, log } from './lib/errors.js';
import { createWorkspaceStore } from './lib/workspaces.js';
import { createTerminalManager } from './terminal.js';

export async function buildApp(overrides = {}) {
  loadConfig(overrides);

  const app = Fastify({ logger: false });
  const workspaceStore = createWorkspaceStore(path.join(config.dataDir, 'workspaces.json'));
  const terminalManager = createTerminalManager();

  app.addHook('onRequest', async (request, reply) => {
    const token = request.headers['x-auth-token'] ?? request.query?.token;
    if (token !== config.token) {
      return fail(reply, 403, 'UNAUTHORIZED', '访问令牌无效');
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return fail(reply, error.status, error.code, error.message);
    }
    if (error.statusCode === 400) {
      return fail(reply, 400, 'INVALID_PARAM', '请求体格式错误');
    }
    log('server', 'error', error.stack ?? String(error));
    return fail(reply, 500, 'INTERNAL', '服务器内部错误');
  });

  registerWorkspaceRoutes(app, { workspaceStore });
  registerSessionRoutes(app, { workspaceStore, terminalManager });

  const wss = new WebSocketServer({ noServer: true });
  app.server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${config.host}`);
    const match = url.pathname.match(/^\/ws\/terminal\/([A-Za-z0-9-]+)$/);
    if (!match) {
      socket.destroy();
      return;
    }
    if (url.searchParams.get('token') !== config.token) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }
    const cols = Number(url.searchParams.get('cols')) || 80;
    const rows = Number(url.searchParams.get('rows')) || 24;
    wss.handleUpgrade(request, socket, head, (ws) => {
      if (!terminalManager.attach(match[1], ws, { cols, rows })) {
        ws.close(4404, 'session not found');
      }
    });
  });

  return { app, workspaceStore, terminalManager };
}

export async function start() {
  const { app, terminalManager } = await buildApp();
  await app.listen({ host: config.host, port: config.port });

  if (await terminalManager.checkTmux()) {
    log('server', 'info', 'tmux 检测通过');
  } else {
    log('server', 'warn', '未检测到 tmux，创建终端会话将失败（macOS: brew install tmux）');
  }
  log('server', 'info', `listening on http://${config.host}:${config.port}`);
  log('server', 'info', `打开前端：http://127.0.0.1:5174/?token=${config.token}`);

  process.on('SIGINT', () => {
    log('server', 'info', 'shutting down（tmux session 保留）');
    terminalManager.killAll();
    app.close().finally(() => process.exit(0));
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  start().catch((error) => {
    log('server', 'error', error.stack ?? String(error));
    process.exit(1);
  });
}
