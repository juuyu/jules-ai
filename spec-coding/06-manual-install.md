# 06 Spec Kit 受限网络手工安装（Windows + Gemini CLI）

> 本章解决：公司电脑不能下载文件、不能安装 uv，只能浏览器访问 github.com 时，如何把 Spec Kit 完整装进项目。
> 适用前提：Windows + Gemini CLI；其余工具组合同理，替换对应目录与脚本即可。内容基于 v1.2.0 源码逐项核对（2026-10）。装好之后的用法见 [05 章](./05-speckit-guide.md)。

## 6.1 原理：为什么不用装 CLI 也能装

`specify` CLI 的 `init` 本质上只做两件事：

1. 把内置核心资产拷进项目的 `.specify/` 目录（资产打包在 CLI 包内，离线可用）
2. 把 10 个命令模板（markdown）按你用的 AI 工具转成对应格式——Gemini CLI 即 `.gemini/commands/*.toml`（本仓库已转换好：[06-gemini-commands](./06-gemini-commands/README.md)，直接复制）

运行时的辅助脚本是自包含的（只用 PowerShell 读写文件，不调用 `specify` 本体），所以把这两步手工复刻 = 等价安装。

三条约定：

- **固定抄 `v1.2.0` tag**，不要用 main 分支（会漂移）
- 复制姿势：打开文件页 → 右上角 **Copy raw file** 按钮复制全文；不要点 Download 或 raw 链接（会被网络策略拦）
- 在公司电脑上用 VS Code 按清单建文件、粘贴、保存（UTF-8，默认即可）

## 6.2 第一部分：`.specify\` 核心（13 个文件，原样照抄）

目标结构（放在你的项目根目录下）：

```text
你的项目\
└─ .specify\
   ├─ memory\
   │  └─ constitution.md              ← 用 constitution-template.md 内容做初始版本
   ├─ templates\
   │  ├─ constitution-template.md
   │  ├─ spec-template.md
   │  ├─ plan-template.md
   │  ├─ tasks-template.md
   │  └─ checklist-template.md
   ├─ scripts\
   │  └─ powershell\
   │     ├─ common.ps1
   │     ├─ create-new-feature.ps1
   │     ├─ setup-plan.ps1
   │     ├─ setup-tasks.ps1
   │     ├─ check-prerequisites.ps1
   │     └─ resolve-template.ps1
   └─ workflows\
      └─ speckit\
         └─ workflow.yml
```

来源文件（均取自 v1.2.0 tag）：

**模板（5 个）**——另存到 `.specify\templates\`：

- [constitution-template.md](https://github.com/github/spec-kit/blob/v1.2.0/templates/constitution-template.md)（同一份内容复制两份：这里一份，`.specify\memory\constitution.md` 一份）
- [spec-template.md](https://github.com/github/spec-kit/blob/v1.2.0/templates/spec-template.md)
- [plan-template.md](https://github.com/github/spec-kit/blob/v1.2.0/templates/plan-template.md)
- [tasks-template.md](https://github.com/github/spec-kit/blob/v1.2.0/templates/tasks-template.md)
- [checklist-template.md](https://github.com/github/spec-kit/blob/v1.2.0/templates/checklist-template.md)

**脚本（6 个）**——另存到 `.specify\scripts\powershell\`：

- [common.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/common.ps1)
- [create-new-feature.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/create-new-feature.ps1)
- [setup-plan.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/setup-plan.ps1)
- [setup-tasks.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/setup-tasks.ps1)
- [check-prerequisites.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/check-prerequisites.ps1)
- [resolve-template.ps1](https://github.com/github/spec-kit/blob/v1.2.0/scripts/powershell/resolve-template.ps1)

**工作流（1 个）**——另存到 `.specify\workflows\speckit\`：

- [workflow.yml](https://github.com/github/spec-kit/blob/v1.2.0/workflows/speckit/workflow.yml)

注意：

- 6 个 PowerShell 脚本互相引用，必须全抄、不能挑；bash / python 版本不用管
- `templates\vscode-settings.json` 及仓库其余内容（src、docs、bundles、extensions、presets 等）与 Gemini CLI 工作流无关，不用抄

## 6.3 第二部分：10 个命令 → `.gemini\commands\`（已转换好，直接复制）

这 10 个文件本仓库已按 v1.2.0 规则转换完成，存放在 **[`06-gemini-commands/`](./06-gemini-commands/README.md)**。逐个点开文件页，用 **Copy raw file** 复制全文，在公司电脑上保存为项目 `.gemini\commands\` 下的同名文件即可：

| 转好的文件（本仓库） | 在 Gemini CLI 里的命令 |
| --- | --- |
| [speckit.constitution.toml](./06-gemini-commands/speckit.constitution.toml) | `/speckit.constitution` |
| [speckit.specify.toml](./06-gemini-commands/speckit.specify.toml) | `/speckit.specify` |
| [speckit.clarify.toml](./06-gemini-commands/speckit.clarify.toml) | `/speckit.clarify` |
| [speckit.plan.toml](./06-gemini-commands/speckit.plan.toml) | `/speckit.plan` |
| [speckit.tasks.toml](./06-gemini-commands/speckit.tasks.toml) | `/speckit.tasks` |
| [speckit.implement.toml](./06-gemini-commands/speckit.implement.toml) | `/speckit.implement` |
| [speckit.analyze.toml](./06-gemini-commands/speckit.analyze.toml) | `/speckit.analyze` |
| [speckit.checklist.toml](./06-gemini-commands/speckit.checklist.toml) | `/speckit.checklist` |
| [speckit.converge.toml](./06-gemini-commands/speckit.converge.toml) | `/speckit.converge` |
| [speckit.taskstoissues.toml](./06-gemini-commands/speckit.taskstoissues.toml) | `/speckit.taskstoissues` |

前 6 个是核心流程；后 4 个建议顺手装齐。

### 转换规则（供核对，或换其他 AI 工具时自行转换）

源目录：[templates/commands（v1.2.0）](https://github.com/github/spec-kit/tree/v1.2.0/templates/commands)。下面 4 条即上面文件夹的生成规则，与 `specify init --integration gemini --script ps` 的内部实现逐行一致：

1. frontmatter 的 `description:` 一行 → TOML 的 `description` 字段；其余 frontmatter（`handoffs:`、`scripts:`）丢弃
2. 正文里所有 `$ARGUMENTS` / `{ARGS}` → `{{args}}`
3. 正文里所有 `{SCRIPT}` → 取**同一个文件** frontmatter `scripts:` 块里 `ps:` 那一行，把开头的 `scripts/` 改为 `.specify/scripts/`。例：`plan.md` 的 `{SCRIPT}` → `.specify/scripts/powershell/setup-plan.ps1 -Json`；`constitution.md` 的 `{SCRIPT}` → `.specify/scripts/powershell/resolve-template.ps1 constitution-template -Json`。正文没有 `{SCRIPT}` 就跳过；正文里若还有其他 `scripts/` 开头的路径引用，同样加 `.specify/` 前缀
4. 正文里形如 `__SPECKIT_COMMAND_SPECIFY__` 的令牌 → 对应 `/speckit.specify`（同类令牌同理；这是给 AI 看的交叉引用文字）

**TOML 骨架：**

```toml
description = "从 frontmatter 抄来的描述"

prompt = """
替换完成后的全部正文，原样粘贴
"""
```

两个小坑（已生成的文件均已处理）：正文里的反斜杠在双引号串中要写成 `\\`；正文含连续三个双引号时，外层改用单引号字面量 `prompt = '''...'''`。

（Gemini CLI 是 commands 布局，命令名用 `.` 分隔；其他工具可能是 `/speckit-xxx` 形式，见官方 integrations 文档。）

## 6.4 环境要求与验证（Windows）

不需要 uv、pip、Python、Node、git：

- 脚本会自动向上查找 `.specify` 目录来定位项目根；项目本身是 git 仓库会更顺（特性会走分支），没有 git 也能跑
- 只需要 PowerShell：官方声明 7+，但脚本未写死版本要求，Windows 自带的 5.1 先测

快速自检（项目根目录执行）：

```powershell
powershell -NoProfile -File .specify\scripts\powershell\resolve-template.ps1 spec-template -Json
```

能输出一段 JSON（模板路径 / 内容）说明脚本 + 模板都放对了。若 5.1 报语法错：能装 PowerShell 7 就装；装不了改用 `.specify\scripts\python\` 版脚本（把规则 3 换成 `py:` 那行，需有 Python）。

正式验证：在项目目录启动 Gemini CLI，输入 `/speckit.constitution`，命令能出现并执行、生成 `.specify\memory\constitution.md` 即安装成功；随后 `/speckit.specify "第一个功能"` 开始正式流程（流程细节见 [05 章](./05-speckit-guide.md)）。

v1.2 的 bundles / extensions / presets 扩展体系暂时不用管，核心流程不依赖它们。

## 6.5 升级与备选路线

- 升级 = 按同样清单重抄新版（把 v1.2.0 换成新版本号）
- 若将来机器能传文件或放开网络：官方离线方案更省事——[air-gapped 安装文档](https://github.com/github/spec-kit/blob/v1.2.0/docs/install/air-gapped.md)（有网机器构建 wheel → `pip install --no-index`）
