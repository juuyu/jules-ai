// node-pty 预编译包中的 spawn-helper 缺少可执行权限（npm 解包后为 644），
// 会导致 posix_spawnp failed，安装后统一补上 755。
import { chmodSync, existsSync } from 'node:fs';
import path from 'node:path';

if (process.platform !== 'win32') {
  const helper = path.join(
    process.cwd(),
    'node_modules',
    'node-pty',
    'prebuilds',
    `${process.platform}-${process.arch}`,
    'spawn-helper',
  );
  if (existsSync(helper)) {
    chmodSync(helper, 0o755);
    console.log(`[fix-node-pty] chmod 755 ${path.relative(process.cwd(), helper)}`);
  }
}
