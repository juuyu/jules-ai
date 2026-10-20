# 教程 01：Windows Terminal 安装、Git Bash 集成与美化

> 目标：让 Windows Terminal（下称 WT）成为你的主终端，默认 shell 是 Git Bash，并完成字体、配色、透明度等美化。
> 改动全部集中在 `settings.json` 一个文件里，随时可回滚。

## 1. 安装 Windows Terminal

三选一：

```powershell
# 方式 A：winget（有管理员权限或 Win11 自带）
winget install --id Microsoft.WindowsTerminal -e
```

```powershell
# 方式 B：scoop 用户级安装（无管理员权限推荐）
scoop bucket add extras
scoop install windows-terminal
```

```
# 方式 C：便携 zip
# 到 https://github.com/microsoft/terminal/releases 下载
# Microsoft.WindowsTerminal_<版本>_8wekyb3d8bbwe.zip，解压后直接运行 WindowsTerminal.exe
```

## 2. 安装 Nerd 字体（美化 + 图标显示的前提）

Nerd 字体在普通编程字体基础上补充了几千个图标字形，starship / eza 的图标全靠它显示。装一次即可。

```powershell
# 方式 A：scoop
scoop bucket add nerd-fonts
scoop install JetBrainsMono-NF
```

```
# 方式 B：手动安装（无 scoop 时）
# 1. 到 https://www.nerdfonts.com/font-downloads 下载 JetBrainsMono
# 2. 解压后全选 .ttf 文件 → 右键 →「为当前用户安装」（不需要管理员权限）
```

装完后字体名是 **JetBrainsMono Nerd Font**。

## 3. 打开并编辑 settings.json

WT 的所有外观、行为都由 `settings.json` 控制：

1. 打开 WT，按 `Ctrl + ,` 进入设置页
2. 点击左下角 **「打开 JSON 文件」**，会调用编辑器打开
3. 文件位置：`%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json`

> 重要：如果你已经用过 WT 且有自己的配置，**不要整文件覆盖**，只把下面需要的段落（`profiles.defaults`、Git Bash profile、`schemes`、`actions`）合并进去。全新安装可直接参考本仓库 [scripts/windows-terminal-settings.json](scripts/windows-terminal-settings.json) 整文件导入。

## 4. 改什么：逐项说明

### 4.1 把 Git Bash 设为默认 shell

WT 会自动检测 Git Bash 并生成 profile。为确保 GUID 一致，在 `profiles.list` 中显式声明：

```json
{
  "defaultProfile": "{2ece5bfe-50ed-5f3a-ab87-5cd4baf7934f}",
  "profiles": {
    "list": [
      {
        "name": "Git Bash",
        "guid": "{2ece5bfe-50ed-5f3a-ab87-5cd4baf7934f}",
        "commandline": "\"C:/Program Files/Git/bin/bash.exe\" -i -l",
        "startingDirectory": "%USERPROFILE%",
        "icon": "C:/Program Files/Git/mingw64/share/git/git-for-windows.ico"
      }
    ]
  }
}
```

| 字段 | 说明 |
|---|---|
| `guid` | 上面的值是 Git for Windows 官方 fragment 使用的固定 GUID，填它可与自动检测的 profile 合并，避免重复 |
| `commandline` | `-i -l` 表示交互式 + 登录 shell，保证 `~/.bashrc` 生效 |
| `startingDirectory` | 新标签的初始目录，可改成 `D:/work` 让新标签直接落在工作区 |

### 4.2 全局默认外观（profiles.defaults）

写在 `profiles.defaults` 里的字段对所有 profile 生效，改一处即可：

```json
"profiles": {
  "defaults": {
    "font": { "face": "JetBrainsMono Nerd Font", "size": 11 },
    "colorScheme": "Catppuccin Mocha",
    "opacity": 92,
    "useAcrylic": true,
    "padding": "8",
    "cursorShape": "bar",
    "bellStyle": "none"
  }
}
```

| 字段 | 改什么 | 效果 |
|---|---|---|
| `font.face` | 换成第 2 步装的 Nerd 字体 | 图标不乱码 |
| `font.size` | 10~13 之间调 | 字号 |
| `colorScheme` | 见 4.3 | 全局配色 |
| `opacity` | 85~100 | 窗口不透明度 |
| `useAcrylic` | true | 亚克力磨砂背景；不喜欢毛玻璃可改 false 纯透明 |
| `padding` | "8" | 内容与窗口边缘留白，视觉更透气 |
| `cursorShape` | bar / vintage / filledBox | 光标形状 |

### 4.3 配色方案

内置可选：`One Half Dark`（清爽）、`Campbell Powershell`（经典）。推荐自定义 **Catppuccin Mocha**（柔和护眼，配色定义已完整写在 [scripts/windows-terminal-settings.json](scripts/windows-terminal-settings.json) 的 `schemes` 段，整段复制即可）。

想要更亮的风格可到 [windowsterminalshell.dev](https://windowsterminalshell.dev) 在线生成其他主题的 JSON。

### 4.4 Quake 模式（全局下拉终端）

在 `actions` 数组加一条，之后任意界面按 `Win + ~` 一键召唤/隐藏终端：

```json
"actions": [
  { "keys": "win+`", "command": { "action": "quakeMode" } }
]
```

## 5. 常用快捷键（WT 自带，无需配置）

| 快捷键 | 功能 |
|---|---|
| `Ctrl + Shift + T` | 新标签页 |
| `Alt + Shift + D` | 智能分屏（自动选择方向） |
| `Alt + Shift + -` / `Alt + Shift + +` | 水平 / 垂直分屏 |
| `Alt + 方向键` | 在分屏之间移动焦点 |
| `Alt + Shift + 方向键` | 调整分屏大小 |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | 切换标签 |
| `Ctrl + Shift + W` | 关闭当前面板 |
| `Win + ~` | Quake 全局下拉（需 4.4 配置） |
| `Ctrl + Shift + P` | 命令面板（所有功能都能搜到） |

## 6. 校验清单

- [ ] 新开 WT 默认进入 Git Bash（提示符是 `$`，且 `echo $BASH_VERSION` 有输出）
- [ ] 字体显示为 JetBrainsMono Nerd Font，后续 starship 图标不乱码
- [ ] 背景半透明、配色为 Catppuccin Mocha
- [ ] `Alt + Shift + D` 能分屏，`Win + ~` 能下拉终端

下一步：[02-bash-config.md](02-bash-config.md) 配置 bash 本体。
