import { describe, expect, it } from 'vitest';
import { run } from '../../server/lib/exec.js';

describe('run', () => {
  it('命令成功时返回 ok:true 与 stdout', async () => {
    const result = await run(process.execPath, ['-e', 'console.log("hello")']);
    expect(result.ok).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('hello');
  });

  it('命令以非零码退出时返回 ok:false 与退出码', async () => {
    const result = await run(process.execPath, ['-e', 'process.exit(3)']);
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBe(3);
  });

  it('命令不存在时返回 ok:false 且 exitCode 为 null', async () => {
    const result = await run('definitely-not-a-command-gwc');
    expect(result.ok).toBe(false);
    expect(result.exitCode).toBeNull();
    expect(result.stderr).toBeTruthy();
  });

  it('超时后返回 ok:false', async () => {
    const result = await run(process.execPath, ['-e', 'setTimeout(() => {}, 500)'], {
      timeout: 100,
    });
    expect(result.ok).toBe(false);
  }, 3000);
});
