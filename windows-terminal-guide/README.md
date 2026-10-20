# Windows Terminal + Git Bash 优化指南

面向「公司电脑 + Gemini CLI + 习惯 bash」的使用场景，把 Windows 上难用的默认终端改造成：

- **简易美化** — Nerd 字体、Catppuccin 配色、半透明亚克力、starship 提示符
- **窗口管理** — 标签页、分屏、Win+` 全局下拉（Quake 模式）
- **快速打开工作目录 + 直连 Gemini CLI** — `g` 命令 / 项目菜单 / 全局热键三种方式

## 目录结构

```
windows-terminal-guide/
├── README.md                          ← 本文件
├── 01-terminal-beautify.md            WT 安装 + Git Bash 集成 + 美化教程
├── 02-bash-config.md                  .bashrc / starship / zoxide 配置教程
├── 03-automation-scripts.md           自动化脚本：快速开目录 + 直连 Gemini
└── scripts/
    ├── windows-terminal-settings.json WT 配置参考文件（可合并进系统配置）
    ├── bashrc.sh                      ~/.bashrc 内容（复制即用）
    ├── starship.toml                  提示符配置（复制即用）
    ├── g.sh                           g / gl 快速启动函数
    ├── project-menu.ps1               PowerShell 项目菜单启动器
    ├── projects.json                  项目列表（改成你自己的路径）
    └── hotkey.ahk                     AutoHotkey v2 全局热键菜单
```

## 快速开始（三步）

| 步骤 | 教程 | 做什么 | 得到什么 |
|---|---|---|---|
| 1 | [01-terminal-beautify.md](01-terminal-beautify.md) | 装 Windows Terminal + Nerd 字体，合并 settings.json | 美化 + 标签/分屏/Quake + Git Bash 作为默认 shell |
| 2 | [02-bash-config.md](02-bash-config.md) | 装 starship/zoxide，拷贝 bashrc.sh 和 starship.toml | 彩色提示符、目录跳转、历史增强 |
| 3 | [03-automation-scripts.md](03-automation-scripts.md) | 拷贝 g.sh，修改 projects.json 里的路径 | `g 项目名` 一条命令跳目录并启动 Gemini CLI |

## 前置检查

在任意终端确认 Gemini CLI 可用（教程所有脚本都依赖它）：

```bash
gemini --version
# 未安装则: npm install -g @google/gemini-cli
```

公司电脑没有管理员权限也完全可行：所有工具都提供 scoop 用户级安装或便携 zip 方式，见各教程对应小节。

## 使用效果速览

配置完成后，日常使用变成这样：

```bash
# 方式一（日常主力）: 一条命令跳到项目目录并启动 Gemini CLI
g ai-hub

# 方式二: Win+R 输入, 直接在项目目录开新终端标签
wt -d D:\work\ai-hub

# 方式三: 桌面双击项目菜单 / 全局热键弹出菜单, 点选即开
```
