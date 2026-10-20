# ============================================================
# g.sh —— 快速打开工作目录 + 直连 Gemini CLI
# 安装: 拷贝到 ~/bin/g.sh (~/.bashrc 第 4 段会自动 source)
# 用法:
#   g <关键词>   → 跳到最匹配的工作目录并启动 gemini
#   g            → 无参数时用 fzf 交互式选择项目
#   gl <关键词>  → 只跳目录, 不启动 gemini
# 配套教程: windows-terminal-guide/03-automation-scripts.md 方案 A
# ============================================================

# !!! 按需修改: 你的工作区根目录 (Git Bash 路径格式, D:\work 写作 /d/work)
export WORK_ROOT="/d/work"

# 内部函数: 选定目标目录
_pick_project() {
  if [ -n "$1" ]; then
    # 有关键词: 从 zoxide 历史目录里模糊匹配
    zoxide query "$@"
  elif command -v fzf >/dev/null 2>&1; then
    # 无关键词: fzf 浏览 WORK_ROOT 下两层内的目录
    find "$WORK_ROOT" -maxdepth 2 -type d -not -path '*/.*' 2>/dev/null \
      | fzf --prompt='选择项目> '
  else
    echo "用法: g <项目名关键词>  (安装 fzf 后可不带参数交互选择)"
    return 1
  fi
}

# 主命令: 跳目录 + 启动 gemini
g() {
  local dir
  dir=$(_pick_project "$@") || return 1
  cd "$dir" && zoxide add "$dir" || return 1
  if command -v gemini >/dev/null 2>&1; then
    gemini
  else
    echo "未找到 gemini 命令: npm install -g @google/gemini-cli"
  fi
}

# 轻量命令: 只跳目录
gl() {
  local dir
  dir=$(_pick_project "$@") || return 1
  cd "$dir" && zoxide add "$dir"
}
