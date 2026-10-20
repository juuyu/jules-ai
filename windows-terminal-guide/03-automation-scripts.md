# 教程 03：自动化脚本 — 快速打开工作目录 + 直连 Gemini CLI

> 前置：已完成教程 01、02（WT 就绪、.bashrc 已含 GEMINI_AUTOSTART 钩子、zoxide 可用）。
> 本教程提供四种方案，按需选用，可叠加。

## 方案总览

| 方案 | 触发方式 | 适合场景 | 依赖 |
|---|---|---|---|
| A. `g` / `gl` 函数 | 终端内敲命令 | 日常主力，已在终端里干活 | zoxide（+fzf 可选） |
| B. PowerShell 项目菜单 | 双击快捷方式 | 从桌面冷启动 | WT + Git Bash |
| C. AutoHotkey 全局热键 | 任意界面按热键 | 全局随手唤起 | AutoHotkey v2 |
| D. 每项目一个 WT profile | WT 标签下拉菜单 | 喜欢全图形化操作 | 无 |

## 方案 A：g / gl 命令（推荐主力）

### 安装

```bash
mkdir -p ~/bin
# 把本仓库 scripts/g.sh 拷到 ~/bin/g.sh
cp /path/to/windows-terminal-guide/scripts/g.sh ~/bin/g.sh
```

`~/.bashrc` 教程 02 第 4 段已包含 `source ~/bin/g.sh`，重开终端生效。

### 使用前：改一个配置

编辑 `~/bin/g.sh`，把 `WORK_ROOT` 改成你的工作区根目录（Git Bash 路径格式，`D:\work` 写作 `/d/work`）：

```bash
export WORK_ROOT="/d/work"
```

### 使用

```bash
g ai-hub    # zoxide 数据库找最匹配 "ai-hub" 的目录 → cd → 启动 gemini
g           # 无参数: fzf 交互式浏览 WORK_ROOT 下项目, 选中即进
gl front    # 只跳目录, 不启动 gemini（gl = goto local? 想成 "goto lite"）
z proj      # 补充: zoxide 原生命令, 纯跳目录
```

工作原理：

1. `g <关键词>` → `zoxide query` 从历史目录里模糊匹配
2. 匹配到 → `cd` 并 `zoxide add`（强化这个目录的匹配权重）
3. 检测到 `gemini` 命令 → 启动；退出 gemini 后回到正常 bash

> zoxide 的匹配基于你的 cd 历史，常用两三天后命中率极高。`zi` 可以交互式管理/查看。

## 方案 B：PowerShell 项目菜单

适合「开机 → 双击 → 直接进项目 + Gemini」的冷启动流程。

### 安装

1. 把 [scripts/project-menu.ps1](scripts/project-menu.ps1) 和 [scripts/projects.json](scripts/projects.json) 拷到固定目录（如 `D:\tools\launcher\`）
2. 编辑 `projects.json`，填入你的项目（路径用 Windows 格式）：

```json
{
  "launchGemini": true,
  "projects": [
    { "name": "ai-hub",   "path": "D:\\work\\ai-hub" },
    { "name": "frontend", "path": "D:\\work\\frontend" }
  ]
}
```

3. 创建桌面快捷方式：右键桌面 → 新建 → 快捷方式，目标填：

```
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\tools\launcher\project-menu.ps1"
```

4. （可选）快捷方式属性里改图标；「快捷键」输入框还能绑一个系统热键

### 使用

双击快捷方式 → 出现编号菜单 → 输编号回车 → WT 在项目目录开新标签并自动启动 Gemini CLI。

工作原理：脚本设置环境变量 `GEMINI_AUTOSTART=1` 后执行 `wt -d <项目路径> nt -- bash.exe -i -l`；新 bash 启动时被 `.bashrc` 钩子捕获该变量，跑一次 `gemini`，退出后留在正常 shell（机制见教程 02 第 3 节第 5 段）。

### 增删项目

只需改 `projects.json`，脚本不用动。新项目克隆下来后加一行即可。

## 方案 C：AutoHotkey 全局热键（进阶）

任意界面按热键弹出项目菜单，回车或点击即开。

1. 安装 [AutoHotkey v2](https://www.autohotkey.com)
2. 把 [scripts/hotkey.ahk](scripts/hotkey.ahk) 拷到任意位置，编辑其中的项目路径（与 projects.json 保持同步）
3. 双击脚本运行；开机自启：`Win + R` 输入 `shell:startup`，把脚本的快捷方式放进去

```ahk
; 热键为 Ctrl+Alt+G（不用 Win+G, 它被 Xbox Game Bar 占用）
^!g:: {
    menu := Menu()
    menu.Add("ai-hub",   (n, p) => OpenProject("D:\work\ai-hub"))
    menu.Add("frontend", (n, p) => OpenProject("D:\work\frontend"))
    menu.Show()
}
```

## 方案 D：每项目一个 WT Profile

不想装任何脚本的话，在 `settings.json` 的 `profiles.list` 里给常用项目各加一个 profile：

```json
{
  "name": "ai-hub",
  "guid": "{11111111-1111-1111-1111-111111111111}",
  "commandline": "\"C:/Program Files/Git/bin/bash.exe\" -i -l",
  "startingDirectory": "D:/work/ai-hub",
  "icon": "D:/work/ai-hub/favicon.ico"
}
```

之后从 WT 标签页的 `▾` 下拉里直接点项目名。GUID 随便填但不重复即可（可用任意 GUID 生成器）。

## 另一个基础技巧：wt -d

不开任何脚本，随时可用：

```
Win + R → wt -d D:\work\ai-hub     # 在指定目录开一个新终端窗口
```

在 WT 里也可以 `Ctrl + Shift + T` 后 cd，适合临时目录。

## 推荐组合与维护建议

- **主力组合**：方案 A（终端内）+ 方案 B（桌面冷启动），覆盖 95% 场景
- 新项目的更新动作只有一个：往 `projects.json` 加一行；`g` 命令则靠 zoxide 自动学习，零维护
- 脚本全部无第三方 Python/Node 依赖：g.sh 是纯 bash，project-menu.ps1 只用 PowerShell 内置的 ConvertFrom-Json
