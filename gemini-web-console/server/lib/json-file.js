import { promises as fs } from 'node:fs';
import path from 'node:path';

// 按路径串行化读-改-写，避免并发写入互相覆盖
const queues = new Map();

export async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(file, value) {
  const previous = queues.get(file) ?? Promise.resolve();
  const next = previous.then(async () => {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2));
    await fs.rename(tmp, file);
  });
  queues.set(file, next.catch(() => {}));
  return next;
}
