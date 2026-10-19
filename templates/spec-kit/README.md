# Spec Kit 项目模板（规范开发 + AI 协作）

> 基于 GitHub 官方 [spec-kit](https://github.com/github/spec-kit)（2026-10 main 分支核验）整理的可复用模板。
> 目标：以后每个新项目都能用同一套规范驱动 AI 编程——**先规格、后代码，人决策、AI 起草，逐步留痕到 PR**。

## 这套模板给你什么

| 文件 | 用途 |
| --- | --- |
| [AI-DEVELOPMENT-RULES.md](./AI-DEVELOPMENT-RULES.md) | 规范开发与 AI 协作规则：人机分工、阶段门禁、每步提示词、分支/提交规范 |
| [WALKTHROUGH.md](./WALKTHROUGH.md) | 完整例子：一句话需求 → spec → plan → tasks → 实现 → converge → 提交 PR |
| [`project-template/`](./project-template/) | 拷贝即用的项目骨架（宪法、定制模板、AGENTS 指令、PR 模板、示例产物） |

## 核心理念（三句话）

1. **宪法一次，功能循环**：`constitution` 每项目只立一次；每个功能走 `specify → plan → tasks → implement ⇄ converge`。
2. **What/Why 与 How 分离**：spec 阶段只谈需求和验收（禁止技术选型），plan 阶段才谈技术。
3. **人守门，AI 干活**：每个斜杠命令产出一份 markdown，**人工审查签字后才进下一阶段**；AI 不许跳步、不许替你做产品决策。

## 两种使用方式

### 方式 A：正式安装（推荐，需要 Python 3.11+ 与 uv）

```bash
uv tool install specify-cli
specify init my-app --integration claude   # integration 按你的工具换：copilot / cursor / gemini …
cd my-app
```

然后用本模板覆盖/补充三处：

```bash
# 1. 直接可用的项目宪法（替换 AI 现场生成的版本）
cp <本模板路径>/project-template/.specify/memory/constitution.md .specify/memory/constitution.md
# 2. 中文引导 + 团队规则的定制模板（spec/plan/tasks/checklist 命令会读 .specify/templates/）
cp <本模板路径>/project-template/.specify/templates/*.md .specify/templates/
# 3. AI 常驻指令与 PR 模板
cp <本模板路径>/project-template/AGENTS.md ./AGENTS.md
mkdir -p .github && cp <本模板路径>/project-template/.github/pull_request_template.md .github/
```

`specify init` 会把官方斜杠命令（`/speckit-*`）装进你的 AI 工具；`.specify/templates/` 下的模板被替换后，命令自动按你的模板产出。

### 方式 B：手工 / 离线（不能装 uv）

直接整体拷贝 `project-template/`，按 [AI-DEVELOPMENT-RULES.md](./AI-DEVELOPMENT-RULES.md) 中的提示词在任意 AI 对话里手动驱动；预转换的 Gemini 斜杠命令见仓库 [spec-coding/06-gemini-commands/](../../spec-coding/06-gemini-commands/README.md)，手工安装步骤见 [spec-coding/06-manual-install.md](../../spec-coding/06-manual-install.md)。

```bash
cp -R project-template/. my-app/
```

## 5 分钟上手（命令速查）

```text
/speckit-constitution   一次    立宪法（用模板里的现成版本，按项目改 5 条原则）
/speckit-specify        每功能  写规格：用户故事 + Given/When/Then 验收场景（只谈 What/Why）
/speckit-clarify        按需    spec 有歧义时追问，答案回写 spec.md
/speckit-plan           每功能  技术方案 + Constitution Check + contracts/ + data-model.md
/speckit-tasks          每功能  按用户故事分组的勾选任务（P1 故事单独就是 MVP）
/speckit-analyze        按需    查 spec ↔ plan ↔ tasks 三层一致性
/speckit-implement      循环    按 tasks.md 逐条实现，完成勾选
/speckit-converge       循环    对照 spec 验收标准评完成度；有缺口继续 implement，直到 Converged
/speckit-checklist      按需    生成专项质检清单
/speckit-taskstoissues  团队用  任务转 GitHub Issues
```

铁律：**一次只调用一个命令；审查产出 → 签字 → 再调下一个。**

## 模板目录

```text
project-template/
├── AGENTS.md                              # AI 常驻指令：本项目走 spec-kit 流程的规矩
├── .specify/
│   ├── memory/
│   │   └── constitution.md                # 现成宪法：5 条可检验原则（按项目改）
│   └── templates/                         # 定制版官方模板（中文引导，命令会读取）
│       ├── spec-template.md
│       ├── plan-template.md
│       ├── tasks-template.md
│       └── checklist-template.md
├── specs/
│   └── 001-checkin-api/                   # 完整示例产物（对应 WALKTHROUGH 的案例）
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── contracts/checkin-api.md
│       ├── quickstart.md
│       └── tasks.md
└── .github/
    └── pull_request_template.md           # PR 与 spec 产物对接（验收场景映射 + 宪法复核）
```

## 延伸阅读（本仓库内）

- 概念与方法论：[spec-coding/01-concepts.md](../../spec-coding/01-concepts.md)、[02-frameworks.md](../../spec-coding/02-frameworks.md)
- 要素写法（需求/方案/任务/约束）：[spec-coding/03-elements.md](../../spec-coding/03-elements.md)
- 官方命令逐步指南：[spec-coding/05-speckit-guide.md](../../spec-coding/05-speckit-guide.md)
- 另一套互补的工程纪律（决策日志/技能/证据）：[deepseek-harness 模板](../deepseek-harness/starter-kit/README.md)
