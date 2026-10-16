# 06-gemini-commands

Spec Kit v1.2.0 核心命令的 **Gemini CLI 格式（TOML）**，共 10 个，由 [06 章手工安装指南](../06-manual-install.md) 的 §6.3 转换规则生成。

## 用途

公司电脑（只能浏览器访问 github.com）手工安装 Spec Kit 时，把这里的文件复制到项目的 `.gemini\commands\` 目录即可：

```text
你的项目\
└─ .gemini\
   └─ commands\
      ├─ speckit.constitution.toml
      ├─ speckit.specify.toml
      ├─ speckit.clarify.toml
      ├─ speckit.plan.toml
      ├─ speckit.tasks.toml
      ├─ speckit.implement.toml
      ├─ speckit.analyze.toml
      ├─ speckit.checklist.toml
      ├─ speckit.converge.toml
      └─ speckit.taskstoissues.toml
```

复制姿势：逐个点开文件页 → 右上角 **Copy raw file** → 在公司电脑上建同名文件粘贴保存（UTF-8 即可，不要走 Download）。

## 生成方式

与 `specify init --integration gemini --script ps` 的内部实现**逐行一致**：

- 来源：spec-kit [v1.2.0](https://github.com/github/spec-kit/tree/v1.2.0) 的 `templates/commands/*.md`
- 参数：agent=`gemini`、script 变体=`ps`（PowerShell，对应 Windows）、参数占位符=`{{args}}`、命令分隔符=`.`
- 规则：见 [06 章 §6.3](../06-manual-install.md)，即 description 提取、`$ARGUMENTS`/`{ARGS}` 替换、`{SCRIPT}` 替换并重写 `scripts/` → `.specify/scripts/` 路径、`__SPECKIT_COMMAND_*__` 令牌解析
- 生成后已用 tomllib 逐文件解析验证：均为合法 TOML，且无 `{SCRIPT}`、`$ARGUMENTS`、`__AGENT__`、`__SPECKIT_COMMAND_*__` 等未替换残留

## 注意

- 这些文件引用 `.specify/scripts/powershell/*.ps1`，依赖 06 章 §6.2 的 13 个核心文件先就位；且仅适用于 Windows + PowerShell（其他系统需自行按 §6.3 规则改用 `sh:` 脚本行）
- 对应 spec-kit **v1.2.0**；升级 Spec Kit 后需按新版模板重新生成
- 其他 AI 工具（Copilot / Claude Code / Cursor 等）格式不同，按 06 章 §6.3 规则转换即可
