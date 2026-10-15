import { randomUUID } from 'node:crypto';
import * as pty from 'node-pty';
import { AppError, log } from './lib/errors.js';
import { run } from './lib/exec.js';

const PING_INTERVAL = 30_000;
const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;

function send(ws, message) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

export function createTerminalManager() {
  const sessions = new Map();
  let tmuxChecked = null;

  async function checkTmux() {
    if (tmuxChecked === null) {
      const result = await run('tmux', ['-V']);
      tmuxChecked = result.ok;
    }
    return tmuxChecked;
  }

  function resize(sessionId, cols, rows) {
    const session = sessions.get(sessionId);
    if (!session || session.exited || !(cols > 0) || !(rows > 0)) return;
    try {
      session.pty.resize(cols, rows);
    } catch {
      // 进程退出瞬间小概率 resize 失败，忽略
    }
  }

  function nudgeResize(sessionId, cols, rows) {
    // 尺寸抖动一次触发 SIGWINCH，让 tmux 客户端在（重）连接后重绘完整画面
    resize(sessionId, cols, Math.max(1, rows - 1));
    setTimeout(() => resize(sessionId, cols, rows), 80);
  }

  async function create({ workspaceId, cwd, cols = DEFAULT_COLS, rows = DEFAULT_ROWS }) {
    if (!(await checkTmux())) {
      throw new AppError('TMUX_NOT_AVAILABLE', '未检测到 tmux，请先安装（macOS: brew install tmux）');
    }
    const tmuxName = `ws-${workspaceId}`;
    let child;
    try {
      child = pty.spawn('tmux', ['new', '-A', '-s', tmuxName, '-c', cwd], {
        name: 'xterm-256color',
        cols,
        rows,
        cwd,
        env: { ...process.env, TERM: 'xterm-256color' },
      });
    } catch (error) {
      throw new AppError('PTY_SPAWN_FAILED', `终端启动失败：${error.message}`);
    }

    const sessionId = randomUUID();
    const session = { sessionId, workspaceId, tmuxName, createdAt: Date.now(), ws: null, exited: false, pty: child };
    sessions.set(sessionId, session);

    child.onData((data) => {
      if (session.ws) send(session.ws, { type: 'output', data });
    });

    child.onExit(({ exitCode }) => {
      session.exited = true;
      log('terminal', 'info', `session=${sessionId} exited code=${exitCode}`);
      if (session.ws) {
        send(session.ws, { type: 'exit', code: exitCode });
        session.ws.close();
        session.ws = null;
      }
      sessions.delete(sessionId);
    });

    log('terminal', 'info', `session=${sessionId} created tmux=${tmuxName} cwd=${cwd}`);
    return sessionId;
  }

  function attach(sessionId, ws, { cols = DEFAULT_COLS, rows = DEFAULT_ROWS } = {}) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    session.ws = ws;

    let alive = true;
    const pingTimer = setInterval(() => {
      if (!alive) {
        ws.terminate();
        clearInterval(pingTimer);
        return;
      }
      alive = false;
      send(ws, { type: 'ping' });
    }, PING_INTERVAL);

    ws.on('message', (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (message.type === 'input') session.pty.write(message.data ?? '');
      else if (message.type === 'resize') resize(sessionId, message.cols, message.rows);
      else if (message.type === 'pong') alive = true;
    });

    ws.on('close', () => {
      clearInterval(pingTimer);
      // 只 detach（保留 pty 与 tmux session），kill 仅来自显式操作
      if (session.ws === ws) session.ws = null;
    });

    nudgeResize(sessionId, cols, rows);
    return true;
  }

  async function kill(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) throw new AppError('SESSION_NOT_FOUND', '终端会话不存在');
    sessions.delete(sessionId);
    try {
      session.pty.kill();
    } catch {
      // 进程可能已自行退出
    }
    // 关闭 tmux 客户端不会终止服务端 session，显式 kill 需同时清理
    await run('tmux', ['kill-session', '-t', session.tmuxName]);
  }

  function list(workspaceId) {
    return [...sessions.values()]
      .filter((session) => !workspaceId || session.workspaceId === workspaceId)
      .map(({ sessionId, workspaceId: wsId, tmuxName, createdAt }) => ({ sessionId, workspaceId: wsId, tmuxName, createdAt }));
  }

  function killAll() {
    for (const session of sessions.values()) {
      try {
        session.pty.kill();
      } catch {
        // 服务退出时尽力清理
      }
    }
    sessions.clear();
  }

  return { checkTmux, create, attach, resize, kill, list, killAll };
}
