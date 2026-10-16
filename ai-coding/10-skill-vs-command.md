# 10 能力封装：Skill 与 Command 怎么选

> 本章解决：手头有一条想让 AI 稳定执行的「经验」——一段提示词、一套流程、一份规范——该封装成 Command（斜杠命令）还是 Skill（技能）？信息截至 2026-10-17，基于 Claude Code 与 Gemini CLI 官方文档核查。两种载体的具体写法（命令 TOML 格式、SKILL.md 结构）见 [`templates/gemini-cli/README.md`](../templates/gemini-cli/README.md) 的技能与命令章节，本章只讲「选哪个、为什么」。

## 10.1 科普：两个概念，一个本质

两个概念来自不同的机制，但回答的是同一个问题：**怎么让 AI 稳定执行一件你不想每次重复交代的事**。

| 概念 | 一句话 | 典型例子 |
| --- | --- | --- |
| Command（斜杠命令） | 用户显式输入 `/name` 触发的提示词模板 | `/git:commit`、`/docs:audit` |
| Skill（技能） | 模型按 `description` 自动判断并激活的能力包 | `docs-maintainer`、`code-reviewer` |

本质区别只有两条：

1. **触发主导权**：Command 由你触发（你喊它才动）；Skill 由模型触发（它认为该用就用）；
2. **封装形态**：Command 是一段提示词模板（单文件）；Skill 是一个能力包（指令 + 脚本 + 参考文档 + 模板，目录结构）。

记住一个对称关系，后面所有判断都从它派生：

> **Command ≈ 禁用了自动触发、只能手动调用的 Skill；Skill ≈ 允许自动触发的 Command。**

### 两个生态的现状（2026-10）

两者关系在不同工具里不一样，封装前先认清所在生态：

| 工具 | 现状 | 依据 |
| --- | --- | --- |
| Claude Code | 已**合并**：自定义命令并入 skills 体系；`.claude/commands/*.md` 仍兼容但属 legacy | 官方原文 "Custom commands have been merged into skills."；新工作官方建议 "Prefer a skill for new work" |
| Gemini CLI | 两种机制**并存互补**：命令目录（TOML）与技能目录（SKILL.md）各自独立 | 技能定位 "on-demand expertise"（按需专家），命令是用户显式入口 |

所以在 Claude Code 里，选型问题简化为「这个 skill 要不要开放自动触发」（frontmatter 里开关）；在 Gemini CLI 里，还要先选载体（TOML 命令 vs SKILL.md 技能）。

## 10.2 机制对比

### 总览

| 维度 | Command | Skill |
| --- | --- | --- |
| 触发 | 用户输入 `/name` | 模型按 description 自动匹配；Claude Code 中也支持 `/name` 手动调用 |
| 本质 | 提示词模板 / 固定流程 | 指令 + 资源的能力包 |
| 载体 | 单文件：`.gemini/commands/*.toml`（Claude Code 旧式 `.claude/commands/*.md`） | 目录：`SKILL.md` + `scripts/` + `references/` + `assets/` |
| 参数 | 显式参数（`{{args}}`） | 自然语言描述任务，无固定参数 |
| 上下文成本 | 不调用则零占用，输入时才展开 | 常驻 name + description（约 100 词/个）；正文触发才加载 |
| 确定性 | 高：绝不误触发，也不会被漏掉 | 概率性：靠描述匹配，可能漏触发 / 误触发 |
| 分发 | 项目 / 用户内的快捷方式 | Agent Skills 开放标准（[agentskills.io](https://agentskills.io)），跨工具通用 |

### Skill 的加载机制：渐进披露（三级）

Skills 基于 Agent Skills 开放标准，核心设计是**渐进披露**（progressive disclosure），三级投放（体量为官方建议值）：

| 级别 | 内容 | 何时进入上下文 | 体量 |
| --- | --- | --- | --- |
| 1 | name + description | 会话启动时**常驻** | ~100 词/技能 |
| 2 | `SKILL.md` 正文 | 模型判断匹配、你批准激活后 | < 5000 词 |
| 3 | bundled resources（`references/`、`scripts/`、`assets/`） | 模型按需读取 / 执行 | 不限 |

Gemini CLI 的完整生命周期（官方五步）：

1. **Discovery**——会话启动，扫描各层目录，把全部启用技能的 name + description 注入系统提示词；
2. **Activation**——模型识别任务匹配某技能描述，调用 `activate_skill` 工具；
3. **Consent**——弹确认框（显示技能名、用途、将获授权的目录路径）；
4. **Injection**——批准后，`SKILL.md` 正文进入对话历史，技能目录加入允许读取的路径；
5. **Execution**——模型按技能流程执行，优先遵循其步骤指引。

技能的发现层级（同名时高优先级覆盖）：内置 < 扩展 < 用户级（`~/.gemini/skills/`）< 工作区级（`.gemini/skills/`）；工作区级随 git 与团队共享，`.agents/skills/` 是跨工具的通用别名。

> 对使用者的直接含义：激活有「确认闸门」，正文只在激活后占 token——技能可以写厚，但 **description 必须精炼准确**，它是激活前模型能看到的唯一信息。

### Command 的展开机制

Commands 是磁盘上的文件，**调用时**才被读入并展开进提示词。以 Gemini CLI 的 TOML（v1）为例：

```toml
# .gemini/commands/git/commit.toml → /git:commit
description = "按暂存区 diff 生成提交信息"
prompt = """
根据以下 diff 生成 Conventional Commits 提交信息：
!{git diff --staged}
"""
```

- **命名空间**：子目录自动转冒号，`commands/git/commit.toml` → `/git:commit`；
- **`{{args}}`**：用户输入注入；出现在 `!{...}` 内时自动 shell 转义（防注入）；
- **`!{shell 命令}`**：执行 shell 并注入输出（执行前弹确认框）；
- **`@{path}`**：注入文件内容或目录清单；
- 项目级与用户级命令同名时项目版优先；`/commands reload` 热加载。

## 10.3 先划边界：不是所有东西都值得封装

选 Command / Skill 之前，先排除两类更容易放错位置的：

- **短小、恒常适用的规矩**（命名风格、提交前跑测试）→ 直接写 `GEMINI.md` / `CLAUDE.md` 常驻，别绕道封装；
- **体量大的查表资料**（错误码全表、接口清单）→ 放 `docs/`，AI 需要时自己读。

四层投放方式的完整决策表见 [`templates/gemini-cli/README.md`](../templates/gemini-cli/README.md) 的「信息该放哪一层」，记忆锚点：

| 信息形态 | 放哪 | 判据 |
| --- | --- | --- |
| 恒常铁律 | 上下文文件（GEMINI.md） | 短、永远适用 |
| 查表资料 | `docs/` + 索引 | 大、按需查 |
| 动作入口 | Command | 确定性、你主动触发 |
| 场景能力 | Skill | 多步骤流程 / 领域知识，需自动生效 |

还有一个高频混淆——**Skill 与 MCP 的分工**。一句话：**Skill 给 AI 加「知识/流程」，MCP 给 AI 加「工具/连接」**。需求是「接入 Jira 的 API」→ MCP（见 09 章）；需求是「团队审查 PR 的规范流程」→ Skill。

## 10.4 两问决策法

对任何一条待封装的「经验」，只问两个问题：

| 问题 | 答 → Command | 答 → Skill |
| --- | --- | --- |
| ① 谁决定何时用？ | 每次由我主动喊 | 希望 AI 遇到相关任务时自己想起 |
| ② 内容是什么形态？ | 单步提示词模板 | 多步流程 + 附带资料/脚本 |

两问答案冲突时，**以 ① 为准**——触发方式决定可靠性模型，比内容形态更重要。

两条官方「该建技能」的判据可以直接背下来用：

- Claude Code 文档：*"Create a skill when you keep pasting the same instructions… or when a section of CLAUDE.md has grown into a procedure rather than a fact."*（当你反复粘贴同一段指示时；或 CLAUDE.md 里某节从「事实」膨胀成「流程」时。）
- Gemini CLI 文档列出的技能价值：Repeatable workflows（多步骤任务稳定复现）、Resource bundling（脚本 / 模板 / 示例随带）、Shared expertise（团队流程打包分发）。

反过来也成立：**流程确定、你永远清楚何时该跑**的东西，留在 Command 更稳——你不会漏跑，它也不会被误触发。

## 10.5 判例集

常见意图的封装选择：

| 意图 | 选择 | 理由 |
| --- | --- | --- |
| 提交前生成 commit message | Command `/git:commit` | 固定操作、你主动触发 |
| 生成 API 文档 / 报表 | Command | 同上；若流程复杂，拆成「Command 入口 + Skill 内核」（见 10.6） |
| 每周文档体检 | Command `/docs:audit` | 只读操作，靠习惯驱动 |
| 新增错误码：取号 → 实现 → 登记码表 | Skill | 多步骤、怕漏流程 |
| 文档维护（同步、校验触发条件） | Skill `docs-maintainer` | 流程型知识，改完代码就该被想起 |
| 「写 X 领域代码时自动遵守的规范」 | Skill | 场景匹配自动生效（注意粒度，见 10.7） |
| 团队 PR 审查流程 | Skill | 官方列举的典型场景（shared expertise） |
| 命名规范三两条 | `GEMINI.md` | 太短，不值得常驻一个技能描述 |
| 错误码全表 | `docs/` | 查表资料 |
| 项目结构 / 模块划分详情 | `docs/architecture.md` | 查表资料；skill 里只放「结构文档何时更新」 |
| 操作 Jira / Confluence | MCP | 工具 / 连接问题，不是知识问题 |

两个常见纠偏：

1. 生成类需求（文档、报表、发版）默认归 Command，但「多步骤 + 带模板/脚本」的不该是纯 Command，拆成入口 + 内核；
2. 「规范」不等于 Skill——先按粒度分三档（GEMINI.md / docs / skill），只有「多步骤且要自动生效」的才进 skill。

## 10.6 组合模式：入口与内核分开

选型不是二选一，最常见的高级形态是**分层**：

1. **Command 入口 + Skill 内核**：`/docs:update` 负责「显式入口 + 固定参数」，实际流程复用 `docs-maintainer` 技能正文。命令里别重复写流程——否则流程升级要改两处；
2. **打包分发**：Gemini CLI 的 extension（`gemini extensions install`）与 Claude Code 的 plugin 都能**同捆技能 + 命令 + MCP**——个人项目用目录，团队分发用扩展；
3. **演进路径**：一次性需求 → 对话里解决；重复出现 → 固化成 Command；流程稳定且常被需要 → 把内核抽成 Skill；团队共用 → 打包进扩展或独立 git 仓库分享（`gemini skills install <url>`）。

> Claude Code 中两者的界限更模糊：skill 默认既能被模型自动触发、也能被 `/name` 手动调用；加上 frontmatter `disable-model-invocation: true` 后即退化成纯命令（只手动）。可理解为「Command 是 Skill 的一种配置」。

## 10.7 反模式清单

1. **description 写得含糊或互相重叠**——它是激活前模型唯一能看到的信息：含糊 = 永远不触发，重叠 = 误触发。官方建议写明用途 + 触发时机（"Use when…"）+ 用户会说的关键词，且技能之间描述互斥；
2. **粒度切太碎**——每个小操作建一个技能，描述互相撞车。按「领域 / 流程」切（code-reviewer、docs-maintainer），不按操作切；
3. **短规则也包技能**——三两条禁令放 GEMINI.md 即可；技能描述本身也占常驻上下文；
4. **查表资料塞进 SKILL.md 正文**——违反渐进披露；正文 < 5000 词，细节进 `references/`；
5. **指望 Command 自动触发，或指望 Skill 每次都触发**——前者机制上不可能，后者是概率性的。关键流程要 100% 执行，写成 Command 靠习惯驱动，或用 GEMINI.md 铁律兜底；
6. **确定性操作让 AI 自由发挥**——能写脚本的（跑 linter、取数据）放进 `scripts/`，官方明确：确定性任务用脚本；
7. **装第三方技能不审查**——技能激活后会获得目录读取授权并可能执行脚本；官方提醒安装前审查 SKILL.md 与脚本，技能内禁止硬编码密钥。

## 10.8 落地五步

1. **收集**：翻过去一个月的对话，把「反复粘贴 / 反复交代」的内容列成清单；
2. **分流**：逐条过 10.3 的四层表 + 10.4 的两问，标出 Command / Skill / GEMINI.md / docs；
3. **先写最简单形态**：Command 就是单文件（TOML / md）；Skill 先写 description（用途 + 触发时机 + 关键词），正文保持聚焦，参考资料进 `references/`；
4. **验证**：`/commands list`、`/skills list` 确认注册；做两个触发测试——刻意问一个相关任务（应激活）、问一个无关任务（不应激活）；Gemini CLI 内置 `skill-creator` 元技能可直接用自然语言生成技能骨架；
5. **迭代**：漏触发 → description 补关键词；误触发 → 收窄描述面或 `/skills disable`；流程升级 → 只改内核（Skill 正文或命令引用的文件）一处。

## 10.9 延伸

- **写法细节**：[`templates/gemini-cli/README.md`](../templates/gemini-cli/README.md)——命令 TOML 全规则、SKILL.md 结构、`docs-maintainer` 实例、信息分层决策表；
- **术语速查**：06 章的 Skill / Command / MCP 词条；
- **相关章节**：07（Claude Code 与 Gemini CLI 实战）、09（什么时候其实是需要 MCP 而不是技能）。

官方文档索引：

| 主题 | 来源 |
| --- | --- |
| Agent Skills 开放标准 | [agentskills.io](https://agentskills.io) |
| Gemini CLI 技能总览（生命周期 / 目录层级 / 管理命令） | 官方仓库 `docs/cli/skills.md` |
| Gemini CLI 技能创建（skill-creator / 手工 / 分享） | 官方仓库 `docs/cli/creating-skills.md` |
| Gemini CLI 技能最佳实践（description / 渐进披露 / 脚本） | 官方仓库 `docs/cli/skills-best-practices.md` |
| Gemini CLI 自定义命令（TOML / `{{args}}` / `!{}` / `@{}`） | 官方仓库 `docs/cli/custom-commands.md` |
| Claude Code Skills（命令合并、frontmatter、触发规则） | code.claude.com/docs/en/skills |
| Claude Code 斜杠命令现状（legacy 说明） | code.claude.com/docs/en/slash-commands |
