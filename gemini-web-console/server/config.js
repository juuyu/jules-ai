import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const DEFAULT_PORT = 7331;

export const config = {
  host: '127.0.0.1',
  port: Number(process.env.GWC_PORT ?? DEFAULT_PORT),
  dataDir: path.join(rootDir, 'data'),
  token: '',
};

export function loadConfig(overrides = {}) {
  Object.assign(config, overrides);
  mkdirSync(config.dataDir, { recursive: true });

  if (!config.token) {
    const tokenFile = path.join(config.dataDir, 'token');
    if (existsSync(tokenFile)) {
      config.token = readFileSync(tokenFile, 'utf8').trim();
    } else {
      config.token = randomBytes(16).toString('hex');
      writeFileSync(tokenFile, config.token, { mode: 0o600 });
    }
  }
  return config;
}
