# ============================================================
# Git Bash 增强配置 —— 复制到 ~/.bashrc
# 配套教程: windows-terminal-guide/02-bash-config.md
# ============================================================

# ---------- 1. 历史记录 ----------
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups   # 忽略空格开头命令 + 去重
shopt -s histappend                # 多窗口追加而非覆盖历史
PROMPT_COMMAND='history -a'        # 每条命令实时写入历史文件

# ---------- 2. starship 提示符 ----------
# 安装: winget install Starship.Starship  (或 scoop install starship)
command -v starship >/dev/null 2>&1 && eval "$(starship init bash)"

# ---------- 3. zoxide 目录跳转 ----------
# 安装: winget install ajeetdsouza.zoxide  (或 scoop install zoxide)
command -v zoxide >/dev/null 2>&1 && eval "$(zoxide init bash)"

# ---------- 4. 项目启动函数 g / gl ----------
# 把 windows-terminal-guide/scripts/g.sh 拷贝到 ~/bin/g.sh
[ -f "$HOME/bin/g.sh" ] && source "$HOME/bin/g.sh"

# ---------- 5. 启动器自动进入 Gemini ----------
# project-menu.ps1 / hotkey.ahk 打开新标签前设置 GEMINI_AUTOSTART=1,
# bash 启动时读到该变量就先跑一次 gemini, 退出后留在正常 shell。
# 不走 wt 命令行传参, 是为了绕开 wt 对分号的特殊解析问题。
if [ "$GEMINI_AUTOSTART" = "1" ]; then
  unset GEMINI_AUTOSTART
  command -v gemini >/dev/null 2>&1 && gemini
fi

# ---------- 6. ls 美化(可选) ----------
# 安装: scoop install eza
if command -v eza >/dev/null 2>&1; then
  alias ls='eza --icons --group-directories-first'
  alias ll='eza -la --icons --git --group-directories-first'
else
  alias ll='ls -la'
fi

# ---------- 7. 常用 alias ----------
alias gs='git status'
alias gl='git log --oneline --graph --decorate -20'
alias gd='git diff'
alias ..='cd ..'

# ---------- 8. Windows 兼容备忘 ----------
# 原生交互式程序显示异常时: 命令前加 winpty, 如 winpty python
# MSYS 路径误转换时(典型 docker): 命令前加 MSYS_NO_PATHCONV=1
