const TOKEN_KEY = 'gwc-token';

const tokenFromUrl = new URLSearchParams(location.search).get('token');
if (tokenFromUrl) localStorage.setItem(TOKEN_KEY, tokenFromUrl);

export function getToken() {
  return new URLSearchParams(location.search).get('token') || localStorage.getItem(TOKEN_KEY) || '';
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'x-auth-token': getToken() };
  if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!payload?.ok) {
    const error = new Error(payload?.error?.message ?? `请求失败（HTTP ${response.status}）`);
    error.code = payload?.error?.code ?? 'UNKNOWN';
    throw error;
  }
  return payload.data;
}

export const api = {
  listWorkspaces: () => request('/api/workspaces'),
  addWorkspace: (path) => request('/api/workspaces', { method: 'POST', body: { path } }),
  removeWorkspace: (id) => request(`/api/workspaces/${id}`, { method: 'DELETE' }),
  listTerminalSessions: () => request('/api/terminal-sessions'),
  createTerminalSession: (workspaceId, cols, rows) =>
    request('/api/terminal-sessions', { method: 'POST', body: { workspaceId, cols, rows } }),
  killTerminalSession: (id) => request(`/api/terminal-sessions/${id}`, { method: 'DELETE' }),
};

export function terminalWsUrl(sessionId, cols, rows) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const query = new URLSearchParams({ token: getToken(), cols: String(cols), rows: String(rows) });
  return `${protocol}://${location.host}/ws/terminal/${sessionId}?${query}`;
}
