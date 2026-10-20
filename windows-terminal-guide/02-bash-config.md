# 教程 02：Git Bash 配置（.bashrc + starship + zoxide）

> 目标：让 Git Bash 有彩色智能提示符、目录快速跳转、增强的历史记录，并为教程 03 的自动化脚本打基础。
> 所有配置内容在本仓库 [scripts/](scripts/) 目录，复制到对应位置即可。

## 1. 先理解 Git Bash 的启动文件加载顺序

教程 01 中 profile 用的是 `bash.exe -i -l`（登录 shell），启动时按以下顺序加载：

```
/etc/profile → ~/.bash_profile → ~/.bashrc
```

注意：登录 shell **默认只读 `~/.bash_profile`**。Git for Windows 通常已自动创建这两个文件并做好转接，先确认一下：

```bash
cat ~/.bash_profile
```

如果里面没有下面两行，手动加上（这保证 `~/.bashrc` 一定被加载）：

```bash
test -f ~/.bashrc && . ~/.bashrc
```

## 2. 安装依赖工具

| 工具 | 作用 | 必需 |
|---|---|---|
| starship | 彩色智能提示符 | 是 |
| zoxide | 目录跳转（记住你常去的目录，越用越准） | 是 |
| fzf | 模糊搜索（g 命令无参数时交互选项目） | 建议 |
| eza | ls 美化（图标 + git 状态） | 可选 |

```powershell
# winget 方式
winget install Starship.Starship
winget install ajeetdsouza.zoxide
winget install junegunn.fzf

# 或 scoop 方式（无管理员权限推荐）
scoop install starship zoxide fzf eza
```

安装后**重开终端**，用 `starship --version`、`zoxide --version` 验证 PATH 已生效。

## 3. 配置 .bashrc

把本仓库 [scripts/bashrc.sh](scripts/bashrc.sh) 的全部内容复制到 `~/.bashrc`（没有则新建）。

配置分 8 段，各段作用：

| 段 | 内容 | 说明 |
|---|---|---|
| 1 | 历史记录 | 容量 1 万条、去重、实时写入，多窗口不丢历史 |
| 2 | starship | 用 `command -v` 判断已安装才启用，没装也不会报错 |
| 3 | zoxide | 同上 |
| 4 | 加载 g/gl 函数 | source `~/bin/g.sh`，见教程 03 |
| 5 | GEMINI_AUTOSTART | 项目菜单打开新标签时自动进入 Gemini CLI 的钩子 |
| 6 | ls 美化 | 有 eza 用 eza，没有退回普通 ls |
| 7 | 常用 alias | git 快捷命令等 |
| 8 | Windows 兼容备忘 | winpty、MSYS_NO_PATHCONV 使用说明（注释形式） |

其中第 5 段是「新标签直连 Gemini」的关键机制：

```bash
# project-menu.ps1 / hotkey.ahk 打开新标签前设置 GEMINI_AUTOSTART=1,
# bash 启动时读到该变量就先跑一次 gemini, 退出后留在正常 shell
if [ "$GEMINI_AUTOSTART" = "1" ]; then
  unset GEMINI_AUTOSTART
  command -v gemini >/dev/null 2>&1 && gemini
fi
```

> 为什么不直接用 `wt ... -- bash -c "gemini; exec bash"`？因为 `wt` 命令行把分号解析为它自己的多命令分隔符，转义在不同启动方式下行为不一致，是 WT 命令行的著名坑。用环境变量传递完全绕开这个问题。

## 4. 配置 starship

```bash
mkdir -p ~/.config
# 把本仓库 scripts/starship.toml 复制为:
~/.config/starship.toml
```

配置要点（见 [scripts/starship.toml](scripts/starship.toml)）：

- **双行提示符**：信息行 + 输入行，长命令不挤
- `directory.truncation_length = 3`：目录只显示最后 3 级，不占地方
- 显示 git 分支 + 工作区状态（脏文件变红）
- 显示 node/python/go 版本（进入含对应语言文件的项目自动出现）
- `cmd_duration`：命令超过 2 秒显示耗时
- `❯` 绿色 = 上条命令成功，红色 = 失败

## 5. 生效与验证

重开一个 WT 标签，逐项检查：

```bash
# 1. 提示符变彩色、有图标（乱码 → 教程 01 字体没装对）
# 2. cd 到几个项目目录后, 验证 zoxide:
z ai-hub          # 跳到最匹配 ai-hub 的历史目录
zi                # fzf 交互式选择历史目录

# 3. 验证 gemini 在 bash 下可用:
gemini --version
```

### 常见问题

| 现象 | 原因 / 解决 |
|---|---|
| 提示符图标变方块 | Nerd 字体未安装或 WT 字体名填错，回教程 01 第 2/4.2 步 |
| `z` 命令不存在 | zoxide 未装或没重开终端 |
| `starship init` 报错 | PATH 里没有 starship，重装后重开终端 |
| `gemini: command not found` | npm 全局包未装：`npm i -g @google/gemini-cli` |
| .bashrc 改了没生效 | `source ~/.bashrc`，或回第 1 步检查 `.bash_profile` 转接 |

下一步：[03-automation-scripts.md](03-automation-scripts.md) 搭建「快速打开工作目录 + 直连 Gemini CLI」的自动化。
