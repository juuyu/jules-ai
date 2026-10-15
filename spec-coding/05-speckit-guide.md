# 05 GitHub Spec Kit 使用指南

> 本章解决：Spec Kit 装好之后具体怎么用？跟着一个完整示例，从"一句话需求"走到可运行代码。

## 5.1 是什么

- [github/spec-kit](https://github.com/github/spec-kit)：GitHub 官方开源工具包，把 spec 驱动开发固化成可安装的"Agent 技能 + 模板 + 目录约定"
- 第二章 2.2 讲它在框架地图中的位置，本章讲动手用法
- 不绑定工具：在现有 AI 编程工具（Copilot / Claude Code / Cursor / Gemini CLI 等）的对话里调用，产物是 markdown 文件，可随代码进 git

当前（2026-10）提供三条独立流程入口：

| 流程 | 用途 | 启用方式 |
| --- | --- | --- |
| Spec-Driven Development | 构建新功能 / 新应用 | 核心自带，本章主线 |
| Bug fixing | 诊断并修复缺陷 | 扩展：`specify extension add bug` |
| Idea assessment | 评估一个想法是否值得投入 | 扩展：`specify extension add assess` |

本文只展开最常用的 SDD 主线。

## 5.2 安装与初始化

### 环境要求

- Python 3.11+ 和 [uv](https://github.github.io/spec-kit/install/uv.html)（包管理器）
- 一个受支持的 AI 编程工具（Copilot、Claude Code、Cursor、Gemini CLI 等）

### 安装并新建项目

```bash
uv tool install specify-cli                  # 安装 specify 命令
specify init shortlink --integration claude  # 初始化项目
cd shortlink
```

- `--integration` 指定对接哪个 AI 工具：把 `claude` 换成你工具的 key（如 `copilot`、`cursor`、`gemini`，完整清单见官方 [integrations 文档](https://github.github.io/spec-kit/reference/integrations.html)）
- 已有代码的仓库不要重建：参考官方的 [existing-project 指南](https://github.github.io/spec-kit/guides/existing-projects.html)

初始化会生成管理流程用的目录（代码目录由后续 plan 阶段决定）：

```text
shortlink/
└── .specify/
    ├── memory/       # 项目宪法存放处
    ├── templates/    # spec / plan / tasks 模板（可自定义）
    └── scripts/      # 命令背后的辅助脚本
```

### 在 AI 工具里调用

- 在项目目录启动 AI 工具，对话里直接输入 `/speckit-xxx`
- `/speckit-*` 是"Agent 技能"而不是终端命令：一次调用一个，审查产出后再继续
- 不同工具的调用形式略有差异（有的显示为斜杠命令，有的走技能机制），见官方 integrations 文档

## 5.3 主线流程：命令与产出

一句话记忆：**宪法一次，功能循环：specify → plan → tasks → implement ⇄ converge**。

| 命令 | 时机 | 主要产出 |
| --- | --- | --- |
| `/speckit-constitution` | 每个项目一次 | `.specify/memory/constitution.md`（项目宪法） |
| `/speckit-specify` | 每个功能开始 | `specs/NNN-功能名/spec.md`（用户故事 + 验收标准） |
| `/speckit-clarify` | 可选：spec 有歧义时 | 追问关键问题并把答案回写 spec.md |
| `/speckit-plan` | spec 确认后 | plan.md + research.md + data-model.md + contracts/ + quickstart.md |
| `/speckit-checklist` | 可选：需要质检清单 | `checklists/` 下的检查清单 |
| `/speckit-tasks` | 方案确认后 | tasks.md（按用户故事分组的勾选式任务清单） |
| `/speckit-analyze` | 可选：查三层一致性 | spec ↔ plan ↔ tasks 缺口报告 |
| `/speckit-implement` | 任务就绪后 | 代码；任务逐条勾选 |
| `/speckit-converge` | 每轮实现后 | 完成度评估，追加到 tasks.md；循环直到 Converged |
| `/speckit-taskstoissues` | 可选：团队协作 | 把任务转成 GitHub Issues |

使用要点：

- 产物全是可读的 markdown，落盘进 git；**每步人工审查通过再走下一步**
- spec 阶段只谈 What / Why（用户故事、验收标准），技术选型留到 plan
- 三道可选质检闸门（clarify / checklist / analyze）按需插入，问题越早暴露越便宜
- implement 与 converge 是循环：converge 报缺口 → 继续实现 → 再 converge，直到报告 Converged

## 5.4 完整示例：短链接服务

目标：走一遍"一句话需求 → 可运行代码"。角色分工：你负责决策与审查，AI 负责产出。

### Step 0：初始化

```bash
uv tool install specify-cli
specify init shortlink --integration claude
cd shortlink
```

### Step 1：立宪法 `/speckit-constitution`

输入（几条长期原则即可）：

> /speckit-constitution 创建项目宪法，关注代码质量、测试覆盖和可维护性。

产出 `.specify/memory/constitution.md`（节选）：

```markdown
# 短链接服务 Constitution

## Core Principles

### I. 接口先行
先定义 HTTP 契约（路径、入参、响应），再写实现；契约变更必须同步文档。

### II. 测试为准（不可妥协）
短码生成、跳转、幂等逻辑必须有自动化测试；测试不通过不合并。

### III. 保持简单
单机部署优先；不引入非必要依赖，新增依赖需在 plan 中说明理由。

## Governance
宪法优先于其他实践；修改需记录原因与日期。

**Version**: 1.0 | **Ratified**: 2026-10-15 | **Last Amended**: 2026-10-15
```

**你要做的**：检查原则是否符合预期——之后的 plan 阶段会逐条做 Constitution Check，它会一直约束 AI。

### Step 2：写规格 `/speckit-specify`

输入（只说做什么、为什么，不碰技术）：

> /speckit-specify 做一个短链接服务：用户提交长链接，得到一条可访问的短链接；访问短链接时跳转到原地址。

产出 `specs/001-shortlink/spec.md`（节选）：

```markdown
# Feature Specification: 短链接服务

## User Scenarios & Testing

### User Story 1 - 生成短链接 (Priority: P1)

用户提交一条长链接，系统返回一条能在浏览器访问的短链接。

**Why this priority**: 没有它就没有整个服务，其余故事都依赖它。
**Independent Test**: 提交合法链接，得到短码并访问成功。

**Acceptance Scenarios**:

1. **Given** 一条合法的长链接，**When** 用户提交，**Then** 返回 6 位短码，且通过短链接能跳回原地址
2. **Given** 同一条长链接，**When** 用户重复提交，**Then** 返回同一个短码（幂等）

### User Story 2 - 短码跳转 (Priority: P1)

**Acceptance Scenarios**:

1. **Given** 一个存在的短码，**When** 访问，**Then** 302 跳转到原链接
2. **Given** 不存在的短码，**When** 访问，**Then** 返回 404

### User Story 3 - 非法输入处理 (Priority: P2)

**Acceptance Scenarios**:

1. **Given** 非 URL 文本，**When** 提交，**Then** 返回明确错误提示且不写入存储
```

**你要做的**：审阅并手改——删掉多余故事、补齐遗漏场景。若有歧义（比如"短码会过期吗"），先运行 `/speckit-clarify` 把问题聊清楚、答案回写 spec，再进入下一步。

### Step 3：出技术方案 `/speckit-plan`

输入（这时才谈技术）：

> /speckit-plan 用 Python 3.12 + FastAPI，SQLite 存储，短码用自增 ID 转 base62。

产出 `plan.md` 及配套文件（节选）：

```markdown
# Implementation Plan: 短链接服务

## Technical Context

**Language/Version**: Python 3.12
**Primary Dependencies**: FastAPI, SQLAlchemy
**Storage**: SQLite（单文件，单机部署）
**Testing**: pytest
**Project Type**: web-service（单项目：src/ + tests/）

## Constitution Check

- ✓ 接口先行：contracts/ 已定义两个接口
- ✓ 测试为准：每个任务包含对应测试
- ✓ 保持简单：仅 2 个第三方依赖

## 接口契约（contracts/links-api.md 节选）

POST /api/links   { "url": "..." } → 201 { "code": "aB3xK9", "short_url": "..." }
GET  /{code}                       → 302 Location: 原链接 | 404
```

同时生成 `research.md`（选型调研）、`data-model.md`（表结构）、`quickstart.md`（本地跑起来）。

**你要做的**：检查选型是否越界（比如引入了宪法禁止的重依赖）、契约是否覆盖 spec 的全部验收场景。不满意就手改 plan.md。

### Step 4：拆任务 `/speckit-tasks`

产出 `specs/001-shortlink/tasks.md`（节选）：

```markdown
# Tasks: 短链接服务

## Phase 1: Setup
- [ ] T001 初始化项目结构与依赖（pyproject.toml、src/、tests/）

## Phase 2: Foundational
- [ ] T002 建立数据模型与 SQLite 接入（src/models.py）

## Phase 3: User Story 1 - 生成短链接 (P1)
- [ ] T003 [P] 实现 base62 编解码与单元测试（src/base62.py、tests/test_base62.py）
- [ ] T004 实现 POST /api/links，含幂等与校验（src/api.py）

## Phase 4: User Story 2 - 短码跳转 (P1)
- [ ] T005 实现 GET /{code} 的 302 与 404（src/api.py）
- [ ] T006 集成测试：提交 → 跳转全链路（tests/test_flow.py）

## Phase 5: User Story 3 - 非法输入处理 (P2)
- [ ] T007 实现 URL 校验与错误响应（src/validation.py）
```

> 任务按用户故事分组（`[P]` 表示可并行）：所以"只做 Phase 1–3"本身就是一个可交付的 MVP。

### Step 5：实现与收敛 `/speckit-implement` ⇄ `/speckit-converge`

```text
/speckit-implement    # AI 按 tasks.md 逐条实现，完成一条勾一条
/speckit-converge     # 对照 spec.md 的验收标准评估完成度，报告追加到 tasks.md
```

- converge 报"未达标"是常态而不是失败：它列出缺口（如"US3 缺少错误码测试"）→ 继续 implement 补齐 → 再 converge
- 循环直到报告显示 **Converged**
- 期间发现 spec 本身缺场景：**先改 spec.md，再让 plan / tasks 跟上**，保持三层一致（可选 `/speckit-analyze` 帮忙查）

### 收尾与下一轮

全部验收标准有实现、有测试，提交 git。之后加新功能（如"短链访问统计"）时：从 `/speckit-specify` 开始新一轮，会新增 `specs/002-stats/` 目录；宪法不用再立。

最终目录：

```text
shortlink/
├── .specify/
│   ├── memory/constitution.md
│   ├── templates/
│   └── scripts/
├── specs/001-shortlink/
│   ├── spec.md            # 需求（用户故事 + 验收标准）
│   ├── plan.md            # 技术方案
│   ├── research.md        # 选型调研
│   ├── data-model.md      # 数据模型
│   ├── contracts/         # 接口契约
│   ├── quickstart.md      # 本地运行指南
│   └── tasks.md           # 任务清单（含 converge 报告）
├── src/                   # 代码
└── tests/                 # 测试
```

## 5.5 实用技巧

- **先用小项目练手**：选"一个晚上能走完"的功能完整跑一遍，再上真实项目
- **spec 自己先起稿**：你写的用户故事才代表真实需求，让 AI 补验收标准和场景
- **宪法 ≤ 5 条**：写"可检验"的原则（"必须有测试"），别写口号（"代码要优雅"）
- **产物是文件，直接手改**：对 AI 产出不满意时，改 markdown 比重新生成更快更准
- **规范变了要回写**：实现中发现的 spec 缺口，先补 spec 再改代码，否则文档会失效
- **别事事走全流程**：改文案、修小 bug 直接动手；流程留给新功能和大改动
- **以官方为准**：命令与机制随版本演进（本文截至 2026-10），最新说明见 [官方文档](https://github.github.io/spec-kit/)
