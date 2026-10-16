# deepseek-harness AI 协作配置模板

> 用途：把 deepseek-harness（DeepSeek 官方开源的 agent harness）仓库里的「AI 协作基础设施」拆成最小可复用模板——常驻指令、分层指令、决策日志、技能、文档预算、人机协作接口——拷贝进新项目即用。
> 目标读者：希望 AI 代理在新项目里「进门就懂规矩」、重复流程不再靠口头交代的人。
> 来源：`deepseek-ai/deepseek-harness` 仓库 `dsh-v0.2.1-alpha.5` tag，全部内容对照该 tag 下的真实文件摘译（核对日期 2026-10-17）。它为什么这样设计、实际怎么运转、可以借鉴什么，见同目录 [ai-practices.md](./ai-practices.md)；本文件只管「放哪些文件、每个文件放什么」。

## 0. 这套配置长什么样

deepseek-harness（下称 DSH）的 AI 协作资产集中在四处：**分层 AGENTS.md**（常驻指令）、**`.agents/notes/`**（决策日志）、**`.agents/skills/`**（技能）、**`docs/` + `scripts/`**（文档体系与机械门禁）。拆成通用模板后的项目结构：

```text
<项目根>/
├── AGENTS.md                    # ★ 唯一指令源：常驻规矩（每个会话必读）
├── CLAUDE.md                    # → 符号链接 → AGENTS.md（Claude Code 读这个）
├── .agents/
│   ├── notes/                   # 决策日志：AI 写的 RFC
│   │   ├── proposed/            #   提案（未实施）
│   │   │   └── architecture/2026-10-17-your-topic.md
│   │   ├── implemented/         #   已实施（记录 shipped 决策）
│   │   │   └── process/2026-10-17-your-topic.md
│   │   └── rejected/            #   已否决（防「复讼」）
│   └── skills/                  # 技能：可复用工作流
│       ├── pre-push-checks/SKILL.md
│       └── code-review/SKILL.md
├── .claude/skills               # → 符号链接 → ../.agents/skills
├── docs/
│   ├── AGENTS.md                # 文档子树的补充规矩（可选）
│   └── architecture.md          # 架构/子系统等分层文档
├── scripts/
│   └── doc-budgets.json         # 文档词数预算（可选门禁）
└── .github/
    ├── pull_request_template.md # 人机协作接口
    └── ISSUE_TEMPLATE/          # Bug / Feature / Task 模板
```

| 资产 | 职责 | 必须性 | DSH 出处 |
| --- | --- | --- | --- |
| 根 `AGENTS.md` | 每个会话都需要的「常驻命令」：布局、命令、约定 | ★ 必须 | [AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/AGENTS.md) |
| 子树 `AGENTS.md` | 子树特有规则，就近生效 | 按需 | [packages/AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/packages/AGENTS.md)、[docs/AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/AGENTS.md) 等 15+ 个 |
| `CLAUDE.md` 符号链接 | 单一来源转发给各家 CLI | ★ 必须 | 根、`packages/`、`vendor/`、`.agents/notes/implemented/` 四处均为 120000 symlink |
| `.agents/notes/` | 保存「为什么」与「放弃了什么」——代码与注释带不走的决策理由 | ★ 强烈建议 | [notes/README.md](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/notes/README.md) |
| `.agents/skills/` | 把重复流程固化成按需加载的工作流 | ★ 强烈建议 | [.agents/skills/](https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.1-alpha.5/.agents/skills)（19 个） |
| 文档预算 manifest | 给常驻文档设词数天花板，防越写越肥 | 可选 | [doc-budgets.manifest.json](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/scripts/doc-budgets.manifest.json) |
| PR / Issue 模板 | 人机协作接口：动机、可观察变化、可复核证据 | ★ 建议 | [pull_request_template.md](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.github/pull_request_template.md) |

---

## 1. 根 AGENTS.md（常驻指令）

### 1.1 设计规则（照抄 DSH 的三条）

1. **只放「每个会话都需要」的规则**——DSH 的文档标准把它定义为 *standing orders*：每条 1~3 行、自包含、附一个指向详细理由的链接（理由的「家」在决策日志或技能里，`one home per fact`）。
2. **每条规则要么可机械检查、要么可在评审中人工执行**。DSH 的惯例是：能在 CI 脚本里查的规则，直接在文本里点名脚本路径（如 `verify-cordis-config` 强制 X）。文本与门禁成对出现，规则不会沦为口号。
3. **词数有天花板**。DSH 给根 `AGENTS.md` 设了 **2080 词**的硬上限（由 `pnpm run verify-doc-budgets` 对照 manifest 强制），超额时必须先「搬家」或「压缩」，确有需要才在 PR 里说明理由上调。理由是：常驻文件每个会话都要占上下文，越肥越稀释重点。

### 1.2 模板骨架（可直接改用）

````markdown
# AGENTS.md

<一句话项目定位>。改 `<关键目录>/` 前先读 [架构文档](docs/architecture.md)；写文档遵循 [docs/AGENTS.md](docs/AGENTS.md)。

## 仓库结构

```text
src/          应用源码（入口 src/main.ts）
docs/         文档（架构、操作指南）
.agents/      AI 协作资产（notes 决策日志、skills 技能）
scripts/      检查脚本与代码生成器
```

## 命令

```sh
pnpm install       # 安装依赖
pnpm dev           # 启动开发环境
pnpm test          # 单元测试（跑相关子集，见下）
pnpm lint          # 静态检查
pnpm build         # 构建
```

- 提交前只跑覆盖本次改动的**最小检查**；不要默认跑全量。
- CI 负责穷尽覆盖与平台矩阵；本地不重复已通过的检查。
- 报告检查结果时**只报告实际跑过的命令**，没跑的不要说「应该没问题」。

## 约定

- **<规则>**：<一句话>（[理由](.agents/notes/implemented/...)）。
- **<规则>**：<一句话>。
- 非平凡决策需在同一提交里记一条 [Agent Note](.agents/notes/README.md)；机械改动与局部 UI 调整豁免。

## 编辑本文件

`CLAUDE.md` 是本文件的符号链接，只编辑本文件。每条规则保持自包含；细节链接到其它文档而不是展开。
````

### 1.3 DSH 真实规则长什么样（摘自其根 AGENTS.md 的「Conventions」一节）

| 领域 | 规则原文（摘译） | 可迁移的点 |
| --- | --- | --- |
| 类型边界 | 信任同进程内已标注类型的边界：不要为静态接口已保证的值加运行时校验和兜底；校验只留在解析器 / 配置 / 队列 / 模型 JSON / 持久化文件 / 进程 / 网络边界 | 用一句话把「该防哪、不该防哪」钉死，AI 就不会到处乱加防御性代码 |
| 空 catch | 空的 `catch` 必须写明捕获的错误和原因，且 `try` 只包一条语句 | 把「AI 常写的坏味道」直接列为规则 |
| 失败哲学 | 配置错误在加载时就大声失败；绝不静默跳过缺失的引用 | 一个词（fails loud）定调整个错误处理风格 |
| 注释纪律 | 注释只讲本地契约，不转述代码、不解释远处行为 | 直接遏制 AI 最爱犯的「注释复读」 |
| 测试哲学 | 测试描述「行为」，不描述「正确性」；行为过时就连测试一起改，并在 PR 说明原因 | 防止 AI 把测试当成「必须永远通过的考试」来僵化 |
| 依赖取舍 | 优先用维护中的依赖而不是手搓——前提是它真的删掉了自有的代码和测试 | 给了 AI 明确的「用库还是手写」判据 |

### 1.4 「命令」一节的两个 DSH 特色

- **沙箱失败处理**：如果 `gh` / 包管理器 / 构建命令因沙箱限制（凭据、网络、IPC）失败，允许在保留失败证据的前提下用「最窄的权限升级」重试一次；**绝不允许绕过测试失败或产品沙箱**。这条避免了代理环境里高频的「命令被沙箱拦了 → 换一条能跑的」的隐性降级。
- **按面选证据**：DSH 把「改动面 → 该跑什么」写进了技能 `dsh-pre-push-checks`（不在根文件展开），根文件只保留原则和入口链接。这就是第 1.1 条「1~3 行 + 链接」的实例。

---

## 2. 子树 AGENTS.md（就近生效）

### 2.1 规则

- 子树文件**只写本子树特有、根文件不重复**的规则；DSH 的文档标准要求子树 `AGENTS.md` 控制在 **600 词**以内（`packages/AGENTS.md` 例外，上限 810 词）。
- 出现的时机：该目录有独立技术栈、独立评审标准、或 AI 频繁犯错的地方。
- 子树的真相来源同样唯一：根文件管不到的细节放这里，而不是把根文件写胖。

### 2.2 模板骨架

````markdown
# AGENTS.md — <子树名>

本文件补充仓库根 [约定](../AGENTS.md)，只写本子树特有规则。

- **<规则>**：<一句话断言>（[理由](../.agents/notes/implemented/...)）。
- **<规则>**：<一句话断言>。
````

### 2.3 DSH 15+ 个子树文件的实际分工（节选）

| 子树 | 管什么（典型规则摘译） |
| --- | --- |
| `packages/` | 插件导出形态、异步操作单一生命周期主、公共面「一个当前消费者也需要签字」、共享状态必须有主、模型面文案从模型视角写 |
| `packages/client/` | GUI 的 slot/props 纪律、业务组件零订阅、导出需用户签字、组件永不接触底层上下文 |
| `docs/` | 文档层级、词数预算、一行一段、slop 清单（见 §6） |
| `benchmarks/` | 性能门禁：输入必须是合成常量，**禁止使用真实会话录制、用户材料和网络**；环境变量不得覆盖性能预算 |
| `snapshots/` | 录制回放测试：进程必须经 CLI 入口启动、文件命名规则、**提交的录制是归一化不动点** |
| `vendor/` | 「不要随意编辑 `vendor/*/src/`」；每一处与上游的偏离都要在 README 里穷尽记录 |
| `scripts/` | 门禁脚本自身规范：「只在单独运行时才能通过的测试是测试的缺陷」 |
| `.github/` | CI runner 策略：PR 工作流与 master 工作流分离，master-only 的检查不进 PR 面板 |

**借鉴**：不必一步到位。新项目往往只需要根文件 + 1 个最常出错的子树文件，长起来再加。

---

## 3. 单一来源 + 多工具转发

### 3.1 模式

DSH 的做法是**只维护一份真实文件 `AGENTS.md`**，其余工具入口全部用符号链接转发（git 里是 mode `120000`）：

| 链接 | 指向 | 给谁用 |
| --- | --- | --- |
| `CLAUDE.md`（根） | `AGENTS.md` | Claude Code |
| `packages/CLAUDE.md` | `AGENTS.md` | Claude Code（子树） |
| `vendor/CLAUDE.md` | `AGENTS.md` | Claude Code（子树） |
| `.agents/notes/implemented/CLAUDE.md` | `AGENTS.md` | Claude Code（子树） |
| `.claude/skills`（目录） | `../.agents/skills` | Claude Code 的技能发现路径 |

好处不需要双份维护；坏处是 Windows 上符号链接需要开发者模式（见 3.3 的替代方案）。DSH 在根文件的「Editing these instructions」一节明确写了这条约定，防止 AI 误编辑链接文件。

### 3.2 创建命令（macOS / Linux）

```sh
ln -s AGENTS.md CLAUDE.md                 # 根：Claude Code 转发
ln -s ../AGENTS.md packages/CLAUDE.md     # 子树转发（按需）
ln -s ../.agents/skills .claude/skills    # 技能目录转发
```

### 3.3 Windows 与验证

- Windows 上 `New-Item -ItemType SymbolicLink`（或 `mklink`）需要开发者模式/管理员；公司机器受限时退而求其次：复制一份并在文件头部注明「**本文件由 AGENTS.md 复制而来，不要直接编辑**」，并在根文件写明同步义务。
- 验证链接状态：`git ls-files -s | grep 120000`（120000 = 符号链接）。
- 其它工具同理：Gemini CLI 可加 `GEMINI.md -> AGENTS.md`，或在其设置里把 `context.fileName` 指向 AGENTS.md（本仓库 `templates/gemini-cli/` 已有对应做法）。

### 3.4 技能目录转发的细节

- DSH 的技能真实目录是 `.agents/skills/`，`.claude/skills` 只是转发链接——技能内容不绑死某一家工具。
- `.agents/skills/.gitignore` 里有一行 `*/agents/openai.yaml`：第三方工具生成的 per-skill 覆盖配置不入库。自己搭这套时，同样建议把「工具生成的元数据」排除在版本控制之外。

---

## 4. `.agents/notes/`——决策日志（AI 写的 RFC）

### 4.1 它解决什么问题

DSH 的原文定义：*Agent Notes 是「由代理执笔的 RFC」——持久化的提案与决策记录，保存理由（rationale）、备选方案（alternatives）、后果（consequences）和所需验证*。代码注释和文档都带不走的「为什么」与「放弃了什么」，放这里。所有 AI 会话共享它，解决「会话无记忆 → 同一问题被反复拍板/反复推翻」的问题。

### 4.2 目录布局与命名（路径即状态）

```text
.agents/notes/
├── proposed/       # 提案：尚未实施（或部分实施）
├── implemented/    # 已实施：描述 shipped 现实（现在时）
└── rejected/       # 已否决：只在「仍能防止一个诱人的错误」时保留
    └── <class>/yyyy-mm-dd-topic-title.md
```

- **生命周期**（第一层目录）= 状态；提案实施后**移动文件夹**，并同步改文件里的 `Status:` 行。
- **分类**（第二层目录）= 决策种类，DSH 的封闭集合是 6 类：`feature`（面向用户/模型的新能力）、`bug-fix`、`simplification`（不加能力地删代码/行为/面）、`architecture`（shipped 源码的结构决策）、`process`（代码外围的工具/流程/政策）、`testing`（测试基础设施与策略）。
- **文件名日期**是「首次提出」的日期（按 git 历史）；note 之间的引用一律用相对 Markdown 链接，不用序号。
- **禁止集中式 INDEX.md**：路径本身就是元数据，索引文件会让不相关的改动互相冲突（DSH 的校验脚本会直接报错拒绝）。

### 4.3 文件模板（DSH 的格式门禁强制以下骨架）

头部三行格式固定：

```markdown
# Agent Note: <标题>

Status: <proposed | implemented | rejected — 一行原因>
```

**proposed/ 骨架**：

```markdown
## Problem        <!-- 动机；写成不依赖解决方案也能读懂 -->
## Proposal       <!-- 打算怎么改；可以用将来时 -->
…（按需的技术细节节：拓扑、协议、schema）…
## Alternatives considered   <!-- 必填 -->
## Acceptance criteria       <!-- 什么可观察状态算完成 -->
## Risks                      <!-- 可能出什么问题、明确放弃什么 -->
```

**implemented/ 骨架**（当前时态描述 shipped 现实）：

```markdown
## Problem
## Decision       <!-- 现在时；提案期标题（Plan/Acceptance criteria 等）在此禁止出现 -->
…（bespoke 节）…
## Alternatives considered   <!-- 必填 -->
## Consequences              <!-- 这笔交易付出了什么、买到了什么 -->
```

**rejected/**：原提案冻结，只在 `Status:` 行写一行否决原因。

`## Alternatives considered` 是**强制节**：每个真实备选方案一段，注明「为什么输」；且规定 **alternatives 是「记录」出来的，不是「发明」出来的**——没记录过的不许事后补编（对早期 note 有一个特批注释形式）。

### 4.4 关键规则清单（全部出自其 notes/README.md）

| 规则 | 一句话 |
| --- | --- |
| 何时写 | 只有「代码、测试和现有文档都解释不了的持久决策理由」才写；机械改动、局部 UI 调整豁免；同一决策已有 owner note 就更新它，不新建重复 |
| 新 note 必查取代 | 每新增一条 note，必须检索同类决策的旧 note，在被取代条目上做完整/部分取代分类：完全取代的在同一 PR 归档，部分取代的互相交叉链接 |
| implemented 保持同步 | note 跟代码走：改路径、改名、改默认值时，**同一提交里就地改事实**；但只同步「事实」，**不是重写「决策」**——决策反转必须新开 note 并交叉链接 |
| 删除 vs 归档 | 只描述小 UI 调整或纯机械改动的 implemented note → **直接删除三件套**并修复入站链接；有历史价值但不再指导未来的 → 归档；理由仍在指导未来（负保证、所有权边界、安全规则、重新引入条件）→ 保持活跃 |
| rejected 的去留 | 只在「输掉的方案仍是一个诱人的、有意义的错误」时保留；过时、不再可能、防不了复讼就删除 |
| 归档 = 冻结 | 归档只允许：移动完整三件套、在 `Status:` 下插入 `Archived: YYYY-MM-DD` 行、重录 sidecar 哈希、修复入站链接。封存后**永久不许**编辑/重排/翻译/修复。DSH 用一个 append-only 的清单文件为每个归档记录哈希封印（`verify-archived-agent-notes --write`），任何篡改都会被校验抓出 |
| 合并 | 完全被取代的 implemented note 可被并入现行 owner 后删除，但必须保留全部独有理由、备选、后果、验证与已知缺口 |

### 4.5 配套门禁（DSH 的实现，供参考）

- `scripts/agent-note-tree.ts`：树结构的唯一事实来源——生命周期与分类都是**封闭集合**，门禁拒绝集合外的目录；文件名必须匹配 `yyyy-mm-dd-*.md`；出现 `INDEX.md` 直接报错。
- `pnpm run verify-agent-note-format`：校验头部三行、`Status:` 与所在文件夹一致、骨架节名与禁令（如 implemented 里不许出现提案期标题）。
- 归档校验 `verify-archived-agent-notes`：封闭分类树、三件套完整、`Archived:` 元数据、sidecar 哈希、append-only 封印清单。

### 4.6 简化落地（三档，按项目规模选）

| 档位 | 做法 |
| --- | --- |
| **最简（推荐起步）** | 只建 `implemented/` 一个目录 + 根 AGENTS.md 一条规则：「非平凡决策在同一提交里加一条 note」。放弃生命周期移动与脚本 |
| **轻量** | `proposed/` + `implemented/` 两态；分类只保留 `architecture` / `process` / `feature` 三个；人工遵守「alternatives 必填」 |
| **完整** | DSH 全套：三态 + 六类 + 取代检查 + 冻结归档 + 校验脚本；如做双语，另加 `foo.zh.md` 配对（DSH 用三件套 + 哈希 sidecar，见 §8.4） |

---

## 5. `.agents/skills/`——技能系统（可复用工作流）

### 5.1 目录解剖

DSH 每个技能是一个目录，`SKILL.md` 必备，配套资源按需：

```text
.agents/skills/<skill-name>/
├── SKILL.md          # 必备：YAML frontmatter + 正文
├── references/       # 可选：细节参考（渐进披露，正文按需引用）
├── templates/        # 可选：模板文件（如 dsh-doc 的 8 个文档模板）
└── scripts/          # 可选：可执行脚本（如 record-browser-gif 的编码脚本）
```

### 5.2 SKILL.md 模板

````markdown
---
name: pre-push-checks
description: 在推送、标记 ready for review、或声称检查通过之前使用：为即将外发的 diff 选出最小必要的测试与检查，而不是反射式地跑全量套件。
---

# <技能名>

<一句：这个技能解决什么。>

## 何时不用

<边界：什么情况不适用；哪些动作需要用户显式请求才执行。>

## 步骤

1. <步骤一：先确认范围（分支、diff 范围）>
2. <步骤二：按改动面选择证据>
3. <步骤三：跑选中的检查>

## 验证

```sh
<具体命令>
```

## 报告

<固定输出格式：报告哪些内容；什么不许宣称（如「未跑的检查不得称通过」）。>
````

### 5.3 frontmatter 字段（对照 DSH 实际用法）

| 字段 | 必须 | 说明 |
| --- | --- | --- |
| `name` | ★ | kebab-case，与目录名一致 |
| `description` | ★ | **写触发条件**：什么时候该用这个技能、它做什么。AI 靠这句话决定要不要加载技能，所以描述的是「何时用」而不只是「是什么」 |
| `disable-model-invocation` | 可选 | `true` = 不许模型自动调用。DSH 只有 `dsh-translate-docs`（重型翻译流程）设为 `true`，同时配 `user-invocable: true`——**重流程只允许人工点名执行**，日常轻量翻译走普通规则 |
| `user-invocable` | 可选 | 供工具识别「可被用户 `/` 调用」 |

其它 18 个技能只用 `name` + `description`，可见元数据能少就少。

### 5.4 正文的设计模式（从 DSH 19 个技能横切提炼）

1. **自我定位为「指导，不是检查清单」**（*guidance, not a checklist*）：多处技能开篇声明，防止模型机械打勾自证。
2. **显式要求 scope**：如 `dsh-prose-standard` 规定「没有显式 scope 就停住」；排除项写死（`vendor/`、归档目录永不触碰）。
3. **先读前置真源**：技能第 0 步通常是「先读这些文件/页面」——把「凭记忆评审」从流程上掐掉。
4. **指向门禁命令**：技能结尾给出确切的 `pnpm run verify-*` 命令清单，技能与脚本互锁。
5. **P0 / 黑名单式否定规则**：高风险场景直接列「不许做什么」。典型：测试稳定性技能明确禁止「加超时 / 加重试 / 全串行 / 吞错误 / 弱断言 / 清理前 sleep」这六种掩盖式修复。
6. **固定报告格式**：要求报告「实际跑过的命令」「边界情况」「未验证的项」，不许夸大完成度（如归档技能明文：不许声称已归档链接有效，校验器故意不查它们）。
7. **渐进披露**：正文只留入口，细节拆到 `references/`；`dsh-doc` 在正文声明「每个 reference 直接从本文件链接，技能没有深层引用链」。

### 5.5 哪些流程值得技能化（DSH 的示例，按目的分）

| 类型 | DSH 技能示例 | 技能化信号 |
| --- | --- | --- |
| 提交/推送门禁 | `dsh-pre-push-checks`（选最小证据）、`dsh-ci-test-reliability`（防 flaky 掩盖） | 每次提交都要交代一遍的事 |
| 评审 | `dsh-code-review`（评审前置清单与判据） | 评审时要反复查同一组标准 |
| 文档 | `dsh-doc`（写/审/迁移文档）、`dsh-prose-standard`（字句级契约）、`dsh-trim-cot-leakage`（清理思维链外泄） | 文案规范多到记不住 |
| 维护 | `dsh-archive-agent-notes`（决策日志归档）、`dsh-find-simplifications`（找可删的维护义务） | 周期性重复的清理工作 |
| 规范细节 | `dsh-error-handling`、`dsh-responsive-ui`、`dsh-client-ui-ux`、`dsh-speed-up-perf` | 一个领域的完整判据，写在根文件会爆字数 |

技能全集的逐一分析见 [ai-practices.md](./ai-practices.md) §4。

---

## 6. 文档体系：层级 + 预算 + 清单

### 6.1 每个事实只有一个「家」（DSH 的层级表，节选）

| 层 | 放什么 | 不放什么 |
| --- | --- | --- |
| 根 AGENTS.md | 每会话必读的常驻命令（1~3 行/条 + 链接） | 故事、示例、情景化流程、任何链接目标的转述 |
| 子树 AGENTS.md | 该子树特有规则 | 根文件已有的全局规则 |
| 架构文档 | 概念地图：组成、核心包、扩展点 | 类型定义、单包细节、决策理由 |
| 决策日志 notes/ | 决策的「为什么、放弃了什么、需要什么验证」 | shipped 之后的迁移计划、验收清单 |
| 操作指南 cookbook/ | 编号步骤的 how-to（每步可验证） | 设计理由（链接到对应 note） |
| 包/模块 README | 该单元自己的契约：配置、语义、限制 | 复述 JSDoc、生成目录、别人的关注点 |

### 6.2 词数预算 manifest（可选，防「文档肥胖」）

DSH 的真实 manifest（`scripts/doc-budgets.manifest.json`）：

```json
{
  "AGENTS.md": 2080,
  "docs/AGENTS.md": 1430,
  "docs/architecture.md": 2410,
  "docs/cordis-primer.md": 600,
  "docs/testing.md": 1350,
  "packages/AGENTS.md": 810,
  "packages/README.md": 994
}
```

超预算时的**三步处理顺序**（DSH 原文政策）：

1. **搬家**——把内容移到它真正的层级，需要时留一行链接；
2. **压缩**——确实属于这里的，写短；
3. **上调**——真的需要空间才调天花板，并在 PR 里说明理由。「天花板太低是预算的 bug，不是内容的 bug」。

细节：天花板是护栏不是减重指标——已达标时保留至少 5% 余量；超标时先冻结天花板，搬完压完再谈上调。

### 6.3 slop 清单（直译 DSH 的 8 条「AI 文案垃圾」特征）

1. **重复规则**——搜特征短语，留一个家，其余改链接；
2. **历史错位**——非历史层级里讲历史（「以前是……」），改成现状 + 链接历史 owner；
3. **状态标注**——「已实现！」「未来将……」，状态会腐烂，交给仓库布局与清单携带；
4. **手工复述目录**——测试清单、包清单、生成目录，源或生成器才是权威；
5. **推理实录**——实现过程的叙述、明显分支的证明、测试走查：保留结论契约，删除推导过程；
6. **理由散落**——同一理由在多个兄弟方法旁重复，应该只在拥有的能力/helper 处写一次；
7. **段落墙**——一段塞多条规则和括号补充，拆开或降级到细节的「家」；
8. **强调膨胀**——到处加粗、大写、「关键的是」，等于哪里都不突出。

### 6.4 机械格式规则（建议直接交给现成工具）

- DSH 强制 **一行一段**（`verify-md-wrap`，用编辑器软换行）、相对 Markdown 链接（`verify-md-links`）、文件尾恰好一个换行（pre-commit 查 `git diff --cached --check`）。
- 你的项目不必字面复刻，但值得在 lint 配置里开等价项：Markdown lint、链接检查、换行规则。

---

## 7. 人机协作接口：PR / Issue 模板

### 7.1 PR 模板（DSH 原文，注释为指导语）

```markdown
## Motivation

<!-- 用一句话说明需要解决的问题，并以 Fixes #NN 或 Related #NN 引用同仓库 Issue。 -->

## Changes

<!-- 高层次说明命令、配置、API、协议或持久化格式的变化；没有则写 None。 -->
<!-- 高层次说明用户、模型或系统可观察行为的变化；没有则写 None。 -->

## Testing

<!-- 每种测试方法添加一个条目。方法保持可见，将可复核证据放进对应的 Proof 区域。 -->

- <!-- 说明命令或步骤，以及它覆盖的行为。 -->

  <details>
  <summary>Proof</summary>

  <!-- 提供测试输出、截图、录屏、日志或其他可复核证据。 -->

  </details>
```

要点：

- **三段式**：动机（必须关联 issue）→ 变化（**可观察行为**变化单独声明，无则显式写 None）→ 测试（每种方法一个条目 + **可复核证据**折叠区）。「没有则写 None」是给 AI 填模板用的：不留空、不含糊。
- 案例细节：DSH 这个模板的注释是**中文的**——内部团队与代理是中文使用者，模板本身就承担了「写给填写者（含 AI）的指令」。

### 7.2 Issue 模板（对接 GitHub Issue Types）

三层模板 `bug.md` / `feature.md` / `task.md`，每个带 type frontmatter：

```markdown
---
name: Bug
about: 记录现有预期行为的失效
type: Bug
---
```

结构强制：「可稳定触发的最小步骤」（Bug）、「预期可观察行为」（Feature）、「Deliverables 清单」（Task）。type 字段与仓库的 issue 自动化流程（分类、加标签）对接。

---

## 8. 可选设施（项目长大后）

### 8.1 门禁脚本的配对原则

DSH 的核心惯例：**每条机械可查的规则 → 一个 `verify-*` 脚本，在 AGENTS.md 里点名**。规则文本和门禁实现成对演进。它的清单里可借用的思路（不必照抄实现）：

- 文档：词数预算、换行、链接、术语禁用表（其 `verify-concrete-terms` 会扫**文件名、符号、散文**找禁用词）；
- 结构：决策日志树（封闭分类、命名格式、无 INDEX.md）；
- 双语：配对完整性（见 8.4）；
- 配置：关键配置文件的引用完整性（如 `verify-cordis-config` 强制声明依赖）。

### 8.2 CI 分层

DSH 把 `ci.yml`（仅 PR）和 `ci-master.yml`（仅 master）分离，让 master-only 的检查不进 PR 面板；平台矩阵（Windows/macOS/Linux）由 CI 拥有，本地只跑最小证据。**新项目可以简单很多**：一个 PR 工作流 + 一个 pre-commit 钩子就够起步。

### 8.3 自动化流程的安全模式（团队规模再用）

- DSH 的 issue/审批自动化有一个值得记住的**安全不变量**：**策略脚本永远从默认分支检出执行**（`persist-credentials: false`），PR 事件只作为数据读取——防止「恶意 PR 改写流水线脚本」被执行（pwn-request 防护）。
- 审批被建模为**加权、可撤销的 commit status**：review 事件串行化处理、`/delegate` 评论触发、失败有独立兜底——适合多人+多代理混合产出的仓库。
- CONTRIBUTING 明确**当前不接受外部 PR**，社区走 Discussions 与插件生态——即这套流程是为「内部团队 + AI 代理」设计的，个人项目可无视此条。

### 8.4 双语配对（如果项目需要中英双份）

DSH 的文档要求「每个在范围内的文档都是中英成对」，机制值得了解：

- 一对 = **三个同目录文件**：`foo.md`、`foo.zh.md`、一致性记录 `foo.i18n.yaml`（按节记录两侧哈希）。不允许 locale 目录、不允许只落一种语言。
- 门禁 `verify-translation-pairing` 查：三件套齐全、哈希与现行内容一致（改了一侧没重录 → 红）、语言切换链接、结构签名（标题层级、表格行列数、代码块逐字节一致）。
- 一致性靠 `--write <pair>` **显式重录**——哈希 diff 就是「已确认」这一动作的可审查记录。
- 门禁的边界被诚实地写出来：*绿色只代表「在这个内容上确认过」，不代表确认本身是可靠的*——翻译质量仍归评审。
- 生成区（如自动生成的目录）不进翻译流程：生成器同时写两侧，只有散文字段需要翻译。

---

## 9. 落地清单（按投入分档）

| 档 | 做什么 | 用时 |
| --- | --- | --- |
| **5 分钟** | ① 写根 `AGENTS.md`（骨架见 §1.2，先填「结构 + 命令 + 5 条约定」）② `ln -s AGENTS.md CLAUDE.md` ③ 拷贝 PR 模板（§7.1） | 半小时 |
| **半天** | ④ 建 `.agents/notes/implemented/` + README 规则精简版（§4.6 最简档）⑤ 把 2~3 个重复流程写成技能（§5.2 模板；建议从「提交前检查」「代码评审」「文档维护」开始）⑥ `.claude/skills -> ../.agents/skills` 转发 | 半天 |
| **完整** | ⑦ proposed/ 两态与取代检查 ⑧ 文档预算 manifest + 检查脚本（§6.2）⑨ slop 清单进评审习惯 ⑩ 双语配对 / CI 分层 / 审批自动化（按需） | 按需 |

**从 DSH 抄这套的真正门槛不在文件数量，而在两条纪律**：① 规则要么能自动查、要么能人工判，不写空话；② 新决策落进 notes、重复流程落进 skills，**不许只留在会话里**。

---

## 10. 信息来源（全部对照 `dsh-v0.2.1-alpha.5` tag）

| 内容 | 链接 |
| --- | --- |
| 根 AGENTS.md | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/AGENTS.md |
| 包层 AGENTS.md | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/packages/AGENTS.md |
| 文档标准 docs/AGENTS.md | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/AGENTS.md |
| 决策日志规则 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.agents/notes/README.md |
| 决策日志文件格式门禁 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/scripts/agent-note-tree.ts |
| 技能目录（19 个） | https://github.com/deepseek-ai/deepseek-harness/tree/dsh-v0.2.1-alpha.5/.agents/skills |
| 词数预算 manifest | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/scripts/doc-budgets.manifest.json |
| 双语配对契约 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/i18n/README.md |
| PR / Issue 模板 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/.github/pull_request_template.md |
| CONTRIBUTING（外部 PR 政策） | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/CONTRIBUTING.md |
| 测试政策 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/testing.md |
| 防御模式五习惯 | https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-alpha.5/docs/defensive-patterns/README.md |
