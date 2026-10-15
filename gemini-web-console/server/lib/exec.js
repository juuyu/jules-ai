import { execFile } from 'node:child_process';

const DEFAULT_TIMEOUT = 30_000;
const MAX_BUFFER = 10 * 1024 * 1024;

export function run(command, args = [], { cwd, timeout = DEFAULT_TIMEOUT } = {}) {
  return new Promise((resolve) => {
    execFile(command, args, { cwd, timeout, maxBuffer: MAX_BUFFER }, (error, stdout, stderr) => {
      if (!error) {
        return resolve({ ok: true, stdout, stderr, exitCode: 0 });
      }
      resolve({
        ok: false,
        stdout: stdout ?? '',
        stderr: (stderr ?? '') || error.message,
        exitCode: typeof error.code === 'number' ? error.code : null,
      });
    });
  });
}
