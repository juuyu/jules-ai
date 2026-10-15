export const CODES = {
  INVALID_PARAM: 400,
  UNAUTHORIZED: 403,
  WORKSPACE_NOT_FOUND: 404,
  SESSION_NOT_FOUND: 404,
  GEMINI_FILE_NOT_FOUND: 404,
  GIT_FAILED: 409,
  TMUX_NOT_AVAILABLE: 500,
  PTY_SPAWN_FAILED: 500,
  INTERNAL: 500,
};

export class AppError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status ?? CODES[code] ?? 500;
  }
}

export function ok(reply, data, status = 200) {
  return reply.code(status).send({ ok: true, data });
}

export function fail(reply, status, code, message) {
  return reply.code(status).send({ ok: false, error: { code, message } });
}

export function log(module, level, message) {
  process.stderr.write(`[${new Date().toISOString()}][${level}][${module}] ${message}\n`);
}
