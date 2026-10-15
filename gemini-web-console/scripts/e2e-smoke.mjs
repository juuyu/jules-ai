// 临时端到端冒烟脚本：REST 创建会话 → WS 输入/输出 → detach 持久化 → kill 清理
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import WebSocket from 'ws';

const execFileAsync = promisify(execFile);

async function tmuxLs() {
  try {
    const { stdout } = await execFileAsync('tmux', ['ls']);
    return stdout;
  } catch (error) {
    return error.stdout ?? '';
  }
}

const BASE = 'http://127.0.0.1:7331';
const token = (await fs.readFile(new URL('../data/token', import.meta.url), 'utf8')).trim();
const headers = { 'x-auth-token': token };

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`PASS: ${message}`);
}

async function json(path, options = {}) {
  const requestHeaders = { ...headers };
  if (options.body !== undefined) requestHeaders['content-type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, { ...options, headers: requestHeaders });
  return { status: res.status, body: await res.json() };
}

const { body: wsList } = await json('/api/workspaces');
assert(wsList.ok && wsList.data.length > 0, '已有工作区');
const workspace = wsList.data[0];

const created = await json('/api/terminal-sessions', {
  method: 'POST',
  body: JSON.stringify({ workspaceId: workspace.id, cols: 100, rows: 30 }),
});
assert(created.status === 201 && created.body.ok, `创建终端会话 201 (tmux session: ws-${workspace.id})`);
const { sessionId } = created.body.data;

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:7331/ws/terminal/${sessionId}?token=${token}&cols=100&rows=30`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

let buffer = '';
const ws1 = await connect();
ws1.on('message', (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.type === 'output') buffer += message.data;
});

await new Promise((r) => setTimeout(r, 1200));
ws1.send(JSON.stringify({ type: 'input', data: 'echo hello-gwc-e2e\r' }));
await new Promise((r) => setTimeout(r, 1200));
assert(buffer.includes('hello-gwc-e2e'), 'WS 收到命令回显输出');

// detach：关闭 WS 后 tmux session 应保留
ws1.close();
await new Promise((r) => setTimeout(r, 500));
assert((await tmuxLs()).includes(`ws-${workspace.id}`), 'detach 后 tmux session 仍在（进程保留）');

// 重连：应收到历史画面重绘
const ws2 = await connect();
let redraw = '';
ws2.on('message', (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.type === 'output') redraw += message.data;
});
await new Promise((r) => setTimeout(r, 1800));
assert(redraw.includes('hello-gwc-e2e'), '重连后收到历史画面重绘');
ws2.close();

// kill：删除会话后 tmux session 应被清理
const killed = await json(`/api/terminal-sessions/${sessionId}`, { method: 'DELETE' });
console.log('DELETE 响应:', killed.status, JSON.stringify(killed.body));
assert(killed.status === 200 && killed.body.ok, 'DELETE 终端会话成功');
const lsAfter = await tmuxLs();
assert(!lsAfter.includes(`ws-${workspace.id}`), 'kill 后 tmux session 已清理');

console.log('\nE2E 全部通过');
process.exit(0);
