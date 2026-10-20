# ============================================================
# project-menu.ps1 —— 项目快速启动菜单
# 用法: 按教程 03 方案 B 创建桌面快捷方式后双击, 或直接:
#       powershell -ExecutionPolicy Bypass -File .\project-menu.ps1
# 依赖: Windows Terminal + Git Bash + .bashrc 中的 GEMINI_AUTOSTART 钩子
# ============================================================

$ErrorActionPreference = "Stop"

# Git Bash 路径, 按需修改
$bash = "C:\Program Files\Git\bin\bash.exe"

# 读取同目录下的项目列表
$configPath = Join-Path $PSScriptRoot "projects.json"
if (-not (Test-Path $configPath)) {
    Write-Host " 找不到配置文件: $configPath" -ForegroundColor Red
    Start-Sleep 2; exit 1
}
$config = Get-Content $configPath -Raw | ConvertFrom-Json

# 打印菜单
Write-Host ""
Write-Host " ===== 项目快速启动 =====" -ForegroundColor Cyan
for ($i = 0; $i -lt $config.projects.Count; $i++) {
    $p = $config.projects[$i]
    Write-Host ("  [{0}] {1,-14}" -f ($i + 1), $p.name) -NoNewline
    Write-Host $p.path -ForegroundColor DarkGray
}
Write-Host "  [q] 退出"
Write-Host ""

$sel = Read-Host " 选择编号"
if ($sel -eq "q" -or $sel -eq "") { exit }

$idx = 0
if (-not [int]::TryParse($sel, [ref]$idx) -or $idx -lt 1 -or $idx -gt $config.projects.Count) {
    Write-Host " 无效输入" -ForegroundColor Red
    Start-Sleep 1; exit 1
}

$proj = $config.projects[$idx - 1]

if ($config.launchGemini -eq $true) {
    # 通过环境变量通知 .bashrc 在新标签里自动进入 gemini
    # (绕开 wt 命令行对分号的特殊解析问题, 机制见教程 02)
    $env:GEMINI_AUTOSTART = "1"
    wt -d $proj.path nt -- $bash -i -l
    Remove-Item Env:GEMINI_AUTOSTART -ErrorAction SilentlyContinue
} else {
    wt -d $proj.path nt
}
