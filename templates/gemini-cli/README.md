# Gemini CLI 项目初始化模板

> 用途：给任何新项目一键铺好「AI 协作基础设施」——常驻规矩、按需知识、
> 自定义命令、技能、文档体系、MCP 配置。
> 目标读者：使用 Gemini CLI 编程、希望 AI 稳定遵守项目规则的人。
>
> 本文基于 google-gemini/gemini-cli 官方仓库文档核查整理（2026-10），
> 细节以官方最新文档为准（见文末索引）。

## 这套模板解决什么问题

用 AI CLI 写代码时，常见痛点：

1. AI 不知道项目规矩（错误码怎么取、工具类在哪、提交规范），每次都要重复说明；
2. 把所有规范一股脑塞进上下文，浪费 token 还稀释重点；
3. 项目文档和代码逐渐脱节，AI 照着过时文档写错代码。

对应解法（本模板已内置）：

| 痛点 | 解法 | 对应文件 |
| --- | --- | --- |
| 规矩每次要重复说 | 常驻上下文文件，每次会话自动加载 | `GEMINI.md` |
| 全塞进去太浪费 | 分层投放：查表类信息放 `docs/`，AI 需要时自己读 | `docs/` + 「按需查阅」索引 |
| 高频操作重复交代 | 固化成自定义命令 | `.gemini/commands/` |
| 复杂流程容易漏步骤 | 做成可激活的技能（渐进披露） | `.gemini/skills/` |
| 子任务污染主对话（探索、审查输出量大） | 派给子代理隔离执行，只回传结论 | `.gemini/agents/` |
| 文档逐渐过时 | 更新流程命令化 + 定期体检 | `/docs:update`、`/docs:audit` |

## 快速开始（三步）

```bash
# 1. 拷贝模板到你的项目根目录（注意包含 .gemini 隐藏目录）
cp -r project-template/. /path/to/your-project/

# 2. 替换所有 <占位符>：GEMINI.md（项目简介、常用命令）、
#    docs/ 各文档的表格内容

# 3. 在项目里启动 gemini，运行验证
/memory show      # 确认 GEMINI.md 已加载
/commands list    # 确认 5 个自定义命令已注册
/skills list      # 确认 docs-maintainer 技能可见
/agents list      # 确认 6 个子代理已注册
```

> Windows 用户：在项目目录执行
> `xcopy project-template .\ /E /H` 或手动拷贝（`.gemini` 是隐藏目录，
> 资源管理器里需开启「显示隐藏文件」）。

## 模板总览

```text
templates/gemini-cli/
├── README.md                          # 本文件
├── settings.project.example.json      # 项目级 settings 参考示例 → <项目>/.gemini/
├── settings.user.example.json         # 用户级 settings 参考示例 → ~/.gemini/
└── project-template/                  # ← 拷贝这个目录的内容到新项目
    ├── GEMINI.md                      # 常驻上下文：简介 + 必守规矩 + 查阅索引
    ├── .geminiignore                  # 排除 node_modules/.env 等，不进 AI 上下文
    ├── .gemini/
    │   ├── settings.json              # 项目级设置 + MCP 服务器入口
    │   ├── commands/                  # 自定义斜杠命令（TOML）
    │   │   ├── git/commit.toml        #   /git:commit  生成提交信息
    │   │   ├── docs/new.toml          #   /docs:new    新建文档
    │   │   ├── docs/update.toml       #   /docs:update 同步更新文档
    │   │   ├── docs/audit.toml        #   /docs:audit  文档体检（只读）
    │   │   └── code/error-code.toml   #   /code:error-code 新增错误码
    │   ├── agents/                    # 子代理（隔离上下文执行子任务）
    │   │   ├── code-reviewer.md       #   代码审查（只读）
    │   │   ├── debugger.md            #   调试专家（假设-验证找根因）
    │   │   ├── test-engineer.md       #   测试工程师（写并跑测试）
    │   │   ├── security-auditor.md    #   安全审计（只读）
    │   │   ├── architect-review.md    #   架构评审（只读，出方案）
    │   │   └── explore.md             #   代码库探索（只读检索）
    │   └── skills/
    │       └── docs-maintainer/       # 技能：文档维护（按需激活）
    │           ├── SKILL.md
    │           └── references/doc-checklist.md
    └── docs/                          # 项目知识库（按需读取）
        ├── README.md                  #   文档索引与写作规范（总入口）
        ├── architecture.md            #   架构与模块划分
        ├── error-codes.md             #   错误码规范与全量码表
        └── conventions.md             #   编码规范与工具类清单
```

## 核心机制：先搞懂「常驻」和「按需」

Gemini CLI 的上下文有四层投放方式，对应四种「AI 获取信息」的时机：

| 机制 | 加载时机 | 启动成本 | 适合放什么 |
| --- | --- | --- | --- |
| `GEMINI.md`（各级） | 会话启动时全部拼接 | 每次都占 token | 必守规矩、简介、索引 |
| `@` 导入（在 GEMINI.md 内） | 加载 GEMINI.md 时展开 | 每次都占 token | 拆分常驻内容的模块化 |
| 子目录 `GEMINI.md`（JIT） | AI 访问该目录文件时才加载 | 几乎为零 | 目录级知识（如工具类说明） |
| Skills | AI 判断任务匹配后激活 | 只占一行描述 | 流程型知识（多步骤操作） |
| Subagents 子代理 | 主 AI 判断或 `@代理名` 派发 | 只占一行描述 | 隔离执行的重活（探索、审查、调试） |
| `docs/` + 索引 | AI 主动 `read_file` 时 | 零（AI 按需读） | 查表信息（错误码、架构） |

**GEMINI.md 的层级**（官方定义，从低到高）：

1. 全局：`~/.gemini/GEMINI.md` —— 个人偏好，所有项目生效；
2. 工作区：项目根目录及其父目录中的 `GEMINI.md`（向上搜索默认在
   `.git` 边界停下）；
3. JIT：工具访问某目录时，自动扫描该目录及各级祖先的 `GEMINI.md`。

**信息该放哪一层——决策表：**

| 信息类型 | 放哪 | 理由 |
| --- | --- | --- |
| 「必须每次都遵守」的铁律（错误码禁令、提交前跑测试） | 根 `GEMINI.md` 的「必守规矩」节 | 常驻，无遗漏 |
| 「做什么任务前要查什么」 | 根 `GEMINI.md` 的「按需查阅」表 | 常驻索引，指向详细文档 |
| 错误码全表、架构细节、工具类清单 | `docs/` 对应文件 | 体量大，按需读 |
| 某目录内代码的专属约定 | 该目录的 `GEMINI.md` | JIT，碰了才加载 |
| 多步骤流程（新增错误码、发版） | `.gemini/skills/` 技能 | 渐进披露，描述常驻正文按需 |
| 高频固定操作 | `.gemini/commands/` 命令 | 用户显式触发，可带参数 |
| 个人跨项目偏好 | `~/.gemini/GEMINI.md` | 不污染项目仓库 |

> 关键技巧：写在「按需查阅」表里的每条，都要给出**触发条件**
> （「新增/修改错误码前 → 读 docs/error-codes.md」）。只写「错误码见
> docs/error-codes.md」，AI 不一定会主动去读。

---

## 文件详解

### 1. GEMINI.md —— 常驻上下文

模板结构分三节，各司其职：

- **必守规矩**：短句 + 禁令式表述（「禁止临时编造」「禁止复用其他模块码段」），
  上限建议 15~20 条，多了 AI 会稀释注意力；
- **按需查阅**：表格 = 任务类型 → 先读哪个文件。这是文档体系的「总路由」；
- **项目特有约束**：受限网络、迁移禁令等一次性交代清楚的背景。

要点：

- **保持短**。目标 1~2 屏。超了就拆成 `docs/` 文件用索引引用；
- **模块化**：内容多时用 `@./docs/xxx.md` 导入语法拆分（注意：导入是
  **加载时全量展开**，属于「常驻」而非「按需」，别拿它当懒加载用）；
- **改文件名兼容多工具**：`.gemini/settings.json` 里设
  `"context": { "fileName": ["GEMINI.md", "AGENTS.md"] }`，同仓库用
  AGENTS.md 的其他工具也能读到；
- **查看与重载**：`/memory show` 看当前拼出的完整上下文；
  `/memory reload` 手工改完 GEMINI.md 后强制重载（重启会话也可）。

**子目录 GEMINI.md（JIT）示例**——工具类目录专用：

```markdown
<!-- src/utils/GEMINI.md -->
# src/utils 工具类目录

- 本目录只存放无副作用纯函数工具；有状态逻辑放 src/services/。
- 新增工具前先看这里已有的实现，禁止重复造轮子。
- 每个工具文件必须导出 JSDoc 注释头。
<!-- AI 读取本目录任何文件时，这份说明才会被加载，平时零开销 -->
```

### 2. .gemini/settings.json —— 项目设置与 MCP 入口

项目级设置文件（用户级在 `~/.gemini/settings.json`，项目级优先）。
模板只放了最保守的三项：

| 配置项 | 作用 | 模板取值 |
| --- | --- | --- |
| `context.fileName` | 上下文文件名（支持数组） | `["GEMINI.md", "AGENTS.md"]` |
| `skills.enabled` | 技能总开关 | `true` |
| `mcpServers` | MCP 服务器（见下文专节） | `{}` 空 |

> **settings.json 支持 `//` 注释**（官方解析器自动剥离注释，CLI 自身修改
> 设置时也会保留注释格式），可以放心在配置里写说明。
> 带注释的参考示例按作用域分两份：
> [settings.project.example.json](./settings.project.example.json)（拷到
> `<项目>/.gemini/settings.json`）与
> [settings.user.example.json](./settings.user.example.json)（拷到
> `~/.gemini/settings.json`，Windows 为 `%USERPROFILE%\.gemini\settings.json`）。

其他高价值配置项（按需加，完整清单见官方 configuration 参考）：

| 配置项 | 说明 | 默认值 |
| --- | --- | --- |
| `general.defaultApprovalMode` | 工具审批模式：`default` 询问 / `auto_edit` 自动批准编辑 / `plan` 只读；yolo 只能命令行开 | `"default"` |
| `model.name` | 指定会话模型 | 未设置 |
| `model.compressionThreshold` | 上下文用量达到多少比例触发压缩 | `0.5` |
| `context.discoveryMaxDirs` | 搜索 GEMINI.md 的最大目录数 | `200` |
| `context.memoryBoundaryMarkers` | 向上搜索 GEMINI.md 的边界标记 | `[".git"]` |
| `context.includeDirectories` | 把工作区外的目录也纳入上下文 | `[]` |
| `skills.disabled` | 禁用指定技能列表 | `[]` |
| `mcp.allowed` / `mcp.excluded` | MCP 服务器白/黑名单 | 未设置 |
| `experimental.autoMemory` | 自动记忆（实验特性，见维护章节） | 关闭 |

### 3. .gemini/commands/ —— 自定义命令

**格式**：每个命令一个 `.toml` 文件，子目录自动命名空间化：

| 文件路径 | 命令 |
| --- | --- |
| `.gemini/commands/git/commit.toml` | `/git:commit` |
| `.gemini/commands/docs/audit.toml` | `/docs:audit` |

**TOML 规则**（官方 v1 格式）：

- 必填 `prompt`；选填 `description`（显示在 `/help` 菜单）；
- `{{args}}`：用户输入注入，命令体内原样替换，`!{...}` 内自动做
  shell 转义（防注入）；
- `!{shell 命令}`：执行 shell 并注入输出（如 `!{git diff --staged}`），
  执行前会弹确认框；
- 项目命令（`.gemini/commands/`）与用户命令（`~/.gemini/commands/`）
  同名时，**项目版优先**；
- 改完运行 `/commands reload` 热加载，`/commands list` 查看已有命令。

**本模板内置 5 个命令**：

| 命令 | 触发时机 | 核心动作 |
| --- | --- | --- |
| `/git:commit` | 提交前 | 按暂存区 diff 生成 Conventional Commits 提交信息 |
| `/docs:new <主题>` | 要写新文档 | 按三要素写文档 + 登记两级索引 |
| `/docs:update [说明]` | 功能改完 | 按文档的「更新触发条件」锁定受影响文档并同步 |
| `/docs:audit` | 每周/里程碑 | 只读体检：输出「事实错误/缺失/建议」分级报告 |
| `/code:error-code <描述>` | 要加错误码 | 规范取号 → 实现 → 登记码表，码段满则停下询问 |

### 4. .gemini/skills/ —— 技能（按需知识）

技能与 GEMINI.md 的区别：GEMINI.md 是**常驻背景**，技能是**按需专家**。

**生命周期**（官方定义）：启动时只注入所有技能的 name + description
（约 100 词/个）→ AI 判断任务匹配后调用 `activate_skill` → 弹出确认框 →
批准后 SKILL.md 正文进入对话、技能目录被授权读取。

**SKILL.md 结构**：

```markdown
---
name: docs-maintainer          # 与目录名一致
description: <最关键！这是 AI 判断是否激活的唯一依据：写清用途 +
             触发关键词>
---

# 正文：核心原则 / 工作流 / 边界（建议 < 5000 词）
```

**目录规范**（除 SKILL.md 外都可选）：

```text
my-skill/
├── SKILL.md       # 必填：指令与元数据
├── scripts/       # 可执行脚本（确定性任务用脚本，别靠 AI 自由发挥）
├── references/    # 深入文档（正文按需引用，渐进披露第二层）
└── assets/        # 模板与素材
```

**三种创建方式**：

1. **让 AI 生成（推荐）**：Gemini CLI 内置 `skill-creator` 元技能，
   直接对它说：
   > 创建一个技能叫 xxx，用于……（描述使用场景和触发时机）
2. **手工**：建目录 + SKILL.md 即可（只有 SKILL.md 是必须的）；
3. **安装/链接**：`gemini skills link /path/to/skill`（本地开发调试）、
   `gemini skills install <git-url>`（分享）。

**本模板内置**：`docs-maintainer`（文档维护技能），含
`references/doc-checklist.md` 演示渐进披露——正文只写工作流，检查清单
放 references 里，激活后才按需读取。

> 跨工具兼容：技能目录也可放 `.agents/skills/`（Agent Skills 开放标准
> 的通用别名），Claude Code 等其他工具同样可读。

> 选型指南：什么时候该封装成技能、什么时候该用命令，见
> [`ai-coding/10 能力封装`](../../ai-coding/10-skill-vs-command.md)。

### 5. .gemini/agents/ —— 子代理（隔离上下文）

子代理是**可派发任务的角色**：主 AI 按 description 自动委派，或用户用
`@代理名` 强制指定。它在**独立的上下文**里执行子任务，只把结果回传主对话——
探索、审查这类输出量大的活，不再污染主会话。

**格式**（官方 schema，已核对）：每个代理一个 `.md` 文件，必须以 YAML
frontmatter 开头，**正文就是该代理的系统提示词**：

```markdown
---
name: code-reviewer            # 必填：小写字母/数字/连字符/下划线
description: 必填：做什么 + 何时派它。主 AI 只看这段决定是否委派
kind: local                    # 选填：local（默认）/ remote
tools:                         # 选填：工具白名单，省略则继承主会话全部工具
  - read_file
  - grep_search
model: gemini-3-flash-preview  # 选填：默认 inherit（跟随主会话模型）
temperature: 0.2               # 选填：默认 1
max_turns: 15                  # 选填：单次任务最大轮数
---

（正文 = 系统提示词：角色 / 工作流 / 输出格式 / 边界）
```

**目录与生效**：

| 目录 | 作用域 |
| --- | --- |
| `.gemini/agents/*.md` | 项目级，随 git 与团队共享 |
| `~/.gemini/agents/*.md` | 用户级，所有项目可用（同名时项目级优先） |

改完运行 `/agents reload` 热加载，`/agents list` 查看已注册代理。

**工具白名单**：支持通配符——`*`（全部）、`mcp_*`（全部 MCP 工具）。
**只读代理**（reviewer / auditor / architect / explore）显式给
`read_file`、`grep_search`、`glob`、`list_directory` 四件套，把「只报告、
不修改」从提示词约定升级为机制保证。

**本模板内置 6 个子代理**（选自 GitHub 流行配置，提示词已按本模板
「原则 / 工作流 / 输出格式 / 边界」风格重写）：

| 子代理 | 职责 | 工具 |
| --- | --- | --- |
| `code-reviewer` | 审查 diff / 文件，输出分级问题清单 | 只读四件套 |
| `debugger` | 假设-验证循环定位根因，修复前先给证据链 | 全部（继承） |
| `test-engineer` | 写并运行测试，只动测试文件 | 全部（继承） |
| `security-auditor` | 扫注入 / XSS / 密钥泄漏等可证实风险 | 只读四件套 |
| `architect-review` | 评审设计、大改动出分步实施计划 | 只读四件套 |
| `explore` | 只读检索代码，回传结论 + 证据链 | 只读四件套 |

**与 Skills 的分工**：Skill 沉淀「流程知识」（怎么一步步做），子代理定义
「可派发的角色」（谁在独立上下文里做）。同一个专业方向（如代码审查）
两边都放是正常现象：技能教方法，代理干活。

> 子代理是较新的预览特性，frontmatter 字段与内置代理（generalist、
> codebase_investigator 等）以官方文档为准。

### 6. docs/ —— 项目知识库

`docs/` 不是 Gemini CLI 的强制约定，而是本模板推荐的**开放知识层**：
AI 用内置的读文件 / 搜索工具按需访问，不占常驻上下文。

| 文档 | 读者 | 更新触发条件 |
| --- | --- | --- |
| `README.md` | 所有要写文档的 AI / 人 | 新增任意文档 |
| `architecture.md` | 需要理解/修改系统结构的人 | 模块增删、依赖变化 |
| `error-codes.md` | 所有写业务代码的人 | 任何错误码改动 |
| `conventions.md` | 写新代码、评审的人 | 规范或工具类变化 |

**三要素**是每篇文档的标配开头：读者是谁 / 解决什么问题 / 何时更新。
第三项最重要——它同时是 `/docs:update` 和 `/docs:audit` 命令的
「扫描依据」。

**`docs/` 还是子目录 `GEMINI.md`？** 判断标准：

- 信息**跟随某个目录里的代码**（工具类约定、模块设计）→ 子目录 JIT GEMINI.md；
- 信息**跨目录、需要被引用**（错误码全表、架构图）→ `docs/` + 索引。

### 7. .geminiignore —— 上下文排除

语法同 `.gitignore`（支持 `*`、`/` 锚定、`!` 取反）。被排除的文件
不会被 AI 读取，也不会出现在 `@` 补全中。**务必排除**：
`node_modules/`、构建产物、`.env` 与密钥文件。修改后需重启会话生效。

---

## MCP 服务器配置详解

MCP 没有独立的目录，配置在 **`settings.json` 的两个对象**里：

| 对象 | 作用 |
| --- | --- |
| `mcpServers` | 逐个定义服务器（每个 key = 一个服务器名） |
| `mcp` | 全局规则：`allowed`（白名单，设置后只连列表内的）/ `excluded`（黑名单）/ `serverCommand`（全局启动命令） |

两种配置方式：

**方式一：命令行添加（自动写进 settings.json）**

```bash
# stdio 型（本地进程，默认传输）
gemini mcp add github npx -y @modelcontextprotocol/server-github

# HTTP / SSE 型（远程服务）
gemini mcp add api-server http://localhost:3000 -t http
gemini mcp add sse-server https://api.example.com/sse/ -t sse

# 带环境变量 / 认证头；-s user 装到用户级（默认 -s project）
gemini mcp add slack node server.js -e SLACK_TOKEN=xoxb-xxx -s user
gemini mcp add secure-http https://api.example.com/mcp/ -t http -H "Authorization: Bearer xxx"

# 管理
gemini mcp list                     # 列出已配置服务器 + 连接状态
gemini mcp remove github
gemini mcp enable / disable <名字>  # 临时启停（配置保留）
```

常用 flag（写入 settings.json 后即为同名字段）：

| flag | 作用 |
| --- | --- |
| `-s, --scope` | `user` / `project`（默认 `project`） |
| `-t, --transport` | `stdio` / `sse` / `http`（默认 `stdio`） |
| `-e, --env KEY=value` | 环境变量，可重复 |
| `-H, --header "K: V"` | HTTP 请求头，可重复 |
| `--timeout` | 超时毫秒数 |
| `--trust` | 跳过该服务器全部确认 |
| `--include-tools` / `--exclude-tools` | 工具白/黑名单（逗号分隔） |
| `--description` | 服务器描述 |

**方式二：手工编辑 settings.json**

```json
{
  "mcpServers": {
    "serverName": {
      "command": "node",
      "args": ["server.js"],
      "env": { "API_KEY": "$MY_API_TOKEN" },
      "cwd": "./server-directory",
      "timeout": 30000,
      "trust": false
    }
  }
}
```

### 字段全参考（已核对 settingsSchema 源码）

**传输方式三选一**：

| 字段 | 含义 |
| --- | --- |
| `command` | stdio：本地可执行文件（uvx / npx / node / docker 均属此类） |
| `url` | SSE 或 HTTP 端点（用 `type` 字段区分） |
| `httpUrl` | Streamable HTTP 端点（新式远程写法） |

**可选字段**：

| 字段 | 说明 | 默认 |
| --- | --- | --- |
| `args` | stdio 命令参数数组 | — |
| `env` | 传给服务器进程的环境变量，`$VAR`/`${VAR}` 跨平台、`%VAR%` 仅 Windows；未定义展开为空串 | — |
| `cwd` | stdio 工作目录 | 当前目录 |
| `timeout` | 请求超时（毫秒） | 600000 |
| `trust` | `true` 跳过该服务器所有确认（**写权限服务器保持 false**） | `false` |
| `includeTools` | 工具白名单，只暴露列出的 | 全部 |
| `excludeTools` | 工具黑名单，**优先级永远高于 includeTools** | — |
| `headers` | `url` / `httpUrl` 的自定义请求头（认证放这里） | — |
| `type` | `stdio` / `sse` / `http`，配 `url` 时用来区分传输 | 按字段推断 |
| `description` | 服务器描述（`gemini mcp add --description` 写入） | — |
| `oauth` | 远程 OAuth 配置块（多数情况可省略：401 时自动发现 + 浏览器授权，令牌缓存在 `~/.gemini/mcp-oauth-tokens.json`） | 自动发现 |
| `authProviderType` | `dynamic_discovery`（默认）/ `google_credentials`（GCP ADC）/ `service_account_impersonation`（IAP 场景） | 自动发现 |
| `targetAudience` / `targetServiceAccount` | 配合 IAP 场景使用 | — |
| `tcp` | WebSocket 传输地址（极少用） | — |

> 另有 `extension` 字段为 CLI 内部标记（记录服务器由哪个扩展提供），勿手写。

安全须知：Gemini CLI 默认会从环境里**抹掉**疑似密钥的变量
（`*TOKEN*`、`*SECRET*`、`*KEY*` 等）；只有你在 `env` 里显式声明的
变量才会传给对应服务器。另外可用 `mcp.allowed` / `mcp.excluded`
在设置层做全局白/黑名单。配置后在会话中用 `/mcp` 查看连接状态。

### 两种传输：stdio 与远程（机制完全对称）

字段表里的三选一（`command` / `url` / `httpUrl`）对应两种传输，
两者的机制差别**只在"消息走哪根管道"**：

| | stdio 本地型（command） | 远程型（url / httpUrl） |
| --- | --- | --- |
| 服务器进程在哪 | 你机器上（CLI 启动时拉起子进程） | 服务商的服务器上（云托管，一直运行） |
| 配置行的含义 | "怎么启动它"（命令 + 参数） | "门牌号"（服务器地址） |
| 工具信息存在哪 | 程序本体的代码里（uvx / npx 拉回的那个包） | 对方服务器的代码里 |
| 凭证怎么给 | 环境变量 / `.env` | OAuth（401 → 弹浏览器授权，令牌存 `~/.gemini/mcp-oauth-tokens.json`）或 headers |
| 工具菜单怎么来 | 启动进程 → 走 stdin/stdout 发工具列表请求 | 连 URL → 走 HTTP 发**同一批**请求 |
| 调用工具时 | `tools/call` 走同一对管道 | `tools/call` 走 HTTP POST |

两种情况跑的是同一套 MCP 握手（`initialize` → `tools/list` → `tools/call`，
报文实况见下一节），两个最容易误解的点：

1. **命令和 URL 都不包含工具信息**。`uvx mcp-atlassian` 只是"把程序叫醒"，
   工具清单是叫醒之后握手现问出来的。验证方法：手动在终端跑
   `uvx mcp-atlassian`，它会"呆住"等输入——它不主动报菜单。
2. **读清单的是 CLI，不是模型**。CLI 拿到全量清单（名字 / 描述 / 参数 schema），
   再把「工具声明」注入模型；模型全程不接触服务器。

> **远程型的菜单是"动态现做"的**：以 Atlassian 官方远程服务器
> （`https://mcp.atlassian.com/v2/mcp`）为例——连接时只暴露一小撮最常用的
> Primary 工具，其余按需发现（省上下文，且服务器端新增工具无需重连即可用）；
> 工具还按权限组过滤（`read_confluence` / `write_confluence` …，Jira 的
> `delete_jira` 默认关闭需管理员开启），每次调用记入 Atlassian 审计日志。
> **同一个 URL，不同账号看到的菜单可能不同。**

### 初次握手：会话启动时的五步报文

上文的"同一套握手"具体长什么样？以下为 JSON-RPC 2.0 报文，会话启动后
几十毫秒内完成（stdio 型走 stdin/stdout 管道，远程型走 HTTP——内容一模一样；
客户端标识已核对 `mcp-client.ts` 源码，工具定义取自 mcp-atlassian 源码）：

```
Gemini CLI（客户端）                    MCP 服务器（如 uvx mcp-atlassian 子进程）
      │── ① initialize：我是谁、我支持什么 ─────→│
      │←─ ② initialize 应答：我是谁、我有什么 ───│
      │── ③ notifications/initialized（静默确认）→│
      │── ④ tools/list：菜单给我看看 ───────────→│
      │←─ ⑤ tools/list 应答：完整菜单 ───────────│
      │                                          │
      │（服务器还可能反向请求 roots/list——        │
      │  "你开着哪些项目目录？"——CLI 照实回答）    │
```

**① CLI → 服务器：initialize（自我介绍）**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 0,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",          // 版本协商，随 SDK 版本
    "capabilities": {
      "roots": { "listChanged": true }        // CLI 声明："我能回答我开着哪些工作目录"
    },
    "clientInfo": {
      "name": "gemini-cli-mcp-client",        // CLI 自报名字（源码原文）
      "version": "0.64.0"                     // 实际为当前 CLI 版本号
    }
  }
}
```

**② 服务器 → CLI：initialize 应答**

```jsonc
{
  "jsonrpc": "2.0",
  "id": 0,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools":     { "listChanged": true },   // "我有工具"——下一步才有人来问菜单
      "prompts":   {},                        // "我有预设提示词"（→ 斜杠命令）
      "resources": {}                         // "我有数据资源"（→ @ 引用）
    },
    "serverInfo": {
      "name": "Atlassian MCP",                // 服务器自报名字（源码注册名）
      "version": "x.y.z"
    }
    // 可选字段 "instructions"：给模型的使用说明，会追加进系统提示词
  }
}
```

> 能力门：CLI 源码里有一行 `if (getServerCapabilities()?.tools == null) return [];`
> ——服务器没声明 `tools`，`tools/list` 根本不会发，工具发现直接跳过。

**③④ 确认与拉菜单**

```jsonc
// CLI → 服务器（通知，无 id、无需应答）
{ "jsonrpc": "2.0", "method": "notifications/initialized" }

// CLI → 服务器
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {} }
```

**⑤ 服务器 → CLI：菜单应答（信息量最大的一步）**

以 mcp-atlassian 源码里的 `create_page` 为例（描述文字为源码原文，有删减）：

```jsonc
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "confluence_create_page",       // 前缀来自 mount(namespace="confluence")
        "description": "Create a new Confluence page.",
        "annotations": {                         // 机器可读的安全标注
          "title": "Create Page",
          "destructiveHint": false               // 对比：update_page 是 true
        },
        "inputSchema": {                         // 模型照这个 schema 生成参数
          "type": "object",
          "properties": {
            "space_key":  { "type": "string",
              "description": "The key of the space ... like 'DEV', 'TEAM', or 'DOC'" },
            "title":      { "type": "string", "description": "The title of the page" },
            "content":    { "anyOf": [{"type":"string"},{"type":"null"}],
              "description": "... Either 'content' or 'content_file' must be provided, but not both." },
            "content_file": { "anyOf": [{"type":"string"},{"type":"null"}],
              "description": "Filesystem path to read the page body from (UTF-8). Useful for bodies too large to pass as an inline tool argument." },
            "content_format": { "type": "string", "default": "markdown",
              "description": "'markdown' (default), 'wiki', 'storage', or 'xhtml'" }
            // …还有 parent_id / emoji / page_width / table_layout / subtype 等
          },
          "required": ["space_key", "title"]
        }
      }
      // …同一响应里还有 confluence_search / confluence_get_page /
      //   confluence_update_page / confluence_delete_page … 平级工具
    ]
    // FastMCP 默认一次返回全部；协议支持 nextCursor 翻页
  }
}
```

**插曲：握手是双向的**——`roots` 能力给了服务器反问的权利：

```jsonc
// 服务器 → CLI
{ "jsonrpc": "2.0", "id": 2, "method": "roots/list" }

// CLI → 服务器（源码实证：file:// URI + 目录名）
{ "jsonrpc": "2.0", "id": 2, "result": { "roots": [
  { "uri": "file:///Users/you/my-project", "name": "my-project" }
] } }
```

**拿到菜单后，CLI 的处理流水线**（`discoverTools` 源码）：

1. **能力门**：服务器没声明 `tools` → 连问都不问；
2. **清洗 schema**：如 `"type": ["string","null"]` 拆成 `"type": "string"` +
   `"nullable": true`（另有 `$schema`、`additionalProperties` 剥离）——为兼容
   Gemini API 的声明格式；
3. **白 / 黑名单过滤**：`includeTools` / `excludeTools` 在这一步生效；
4. **注册**：存为 `(服务器名, 工具名, 描述, schema, trust, isReadOnly)`；其中
   `isReadOnly` 取自服务器的 `readOnlyHint` 标注（`confluence_search` 是 `true`，
   `update_page` 不是）；
5. **注入模型**：以全名 `mcp_{配置名}_{工具名}` 作为「工具声明」发给模型。

> 想亲眼看报文：`gemini --debug` 运行时可见 MCP 消息流（交互模式按 F12 开
> 调试控制台）；`/mcp` 显示的则是第 ⑤ 步应答的摘要视图。手动跑
> `uvx mcp-atlassian` 时的"呆住"现象，就是它在等第 ① 条 `initialize` 报文。

### 运行时机制：AI 是怎么用到 MCP 的

**① 启动发现**：每次会话启动，CLI 逐台连接配置的服务器 → 拉取工具列表
（名称 / 描述 / 参数 schema）→ 清洗 schema 以兼容 Gemini API → 注册进全局
工具注册表。**没暴露任何工具的服务器会被自动断开**；启动时看到
"MCP issues detected. Run /mcp list for status." 就是有服务器连不上。

**② 工具命名**：每个工具按全名 `mcp_{服务器名}_{工具名}` 注册（如
`mcp_confluence_confluence_create_page`，`/mcp` 里能看到实际名字）。
⚠️ **服务器名不要用下划线**（用 `my-server` 而非 `my_server`）——策略引擎
按 `mcp_` 之后第一个下划线切分服务器名，带下划线会让通配规则静默失效。

**③ 模型视角**：MCP 工具与内置工具（读文件、执行命令）同等对待，以
「工具声明」注入给模型。你用自然语言提需求，模型自己决定调哪个工具、
生成什么参数——不需要手动喊工具名。

**④ 调用确认**：除非 `trust: true`，每次调用弹确认框：单次执行 / 总是允许
该工具 / 总是允许该服务器 / 取消。后两者记入白名单，之后不再询问。

**⑤ 执行回传**：模型发出工具调用 → 按 schema 校验参数 → 调服务器执行 →
结果一份回给模型继续推理、一份格式化展示给你（支持文本 + 图片等多模态）。

**除工具外，服务器还能提供三样东西**：

| 能力 | 使用方式 |
| --- | --- |
| Resources（数据资源） | 对话里用 `@server://resource/path` 引用，内容自动注入 |
| Prompts（预设提示词） | 直接变成斜杠命令，如 `/poem-writer --title="x"` |
| Instructions（使用说明） | 服务器声明后自动追加进系统提示词 |

**日常管理**：

- 会话内：`/mcp`（状态 + 工具清单）、`/mcp auth <名字>`（OAuth 登录）、
  `/mcp enable <名字>` / `/mcp disable <名字>`（临时启停）；
- 终端：`gemini mcp list / remove / enable / disable`，启停状态存
  `~/.gemini/mcp-server-enablement.json`；
- 文件夹未受信任时，stdio 服务器显示 Disconnected，先 `gemini trust`。

### 端到端实例：AI 为 Confluence 增 / 改 / 删文档

以常用社区服务器 **mcp-atlassian**（工具名已核对其官方文档）为例，把
「配置 → 运行」串成一个完整场景。先记住四个角色的分工：

| 角色 | 职责 | 边界 |
| --- | --- | --- |
| 模型 | 看工具菜单，生成"调哪个工具、填什么参数"的 JSON | 没有凭证、不连网络 |
| Gemini CLI | 拉菜单、弹确认框、传话 | 不理解内容 |
| mcp-atlassian 进程 | 拿你的 token，把工具调用翻译成 Confluence REST API 请求 | 不被调用就不动作 |
| Confluence | 真正执行增删改，权限完全取决于 token | 不知道"AI"的存在 |

> 前置配置即本模板 `settings.project.example.json` 里的 `confluence` 块。
> 注意凭证形态区分：**Cloud 版**用 `CONFLUENCE_USERNAME`（邮箱）+
> `CONFLUENCE_API_TOKEN`；**Server / DC 版**（公司自建）用
> `CONFLUENCE_PERSONAL_TOKEN`（PAT）。凭证值放哪见下文「凭证落地」。

**创建**（"把 docs/api/user-service.md 发布到 DEV 空间，标题《用户服务 API 文档》"）：

1. 模型选中 `confluence_create_page`（参数：`space_key` 必填、`title` 必填、
   正文 `content` 或 `content_file`）；
2. 文档较大时模型用 `content_file` 只传路径：
   `{ "space_key": "DEV", "title": "用户服务 API 文档", "content_file": "docs/api/user-service.md" }`；
3. CLI 弹确认框（`trust: false`）→ 你允许；
4. 调用发给 mcp-atlassian → 它读文件、markdown 转 Confluence 格式、
   用你的 token 调 REST API；
5. 返回页面 ID + 链接 → 喂回模型 → 模型告知你"已创建，链接 …"。

**修改**（"更新那篇文档，补充错误码章节"）——必须先查，因为 update 需要 page_id：

1. `confluence_search`：`{ "query": "space=DEV AND title~'用户服务 API 文档'" }` → 拿到 page_id；
2. `confluence_get_page`：`{ "page_id": "123456", "include_metadata": true }` → 拿当前正文；
3. 对照本地最新文档生成新全文 → `confluence_update_page`：
   `{ "page_id": "123456", "title": "…", "content": "…新全文…" }`；
4. 页面版本号由服务器自动 +1（模型不用管）；只想改某一节可用
   `confluence_update_page_section`。

**删除**（"删掉过时的《旧版 API 文档》"）：

1. 同样先 `confluence_search` 拿到 page_id（delete 只接受 page_id，找不到就删不了）；
2. `confluence_delete_page`：`{ "page_id": "987654" }` → 确认框 → 页面移入回收站。

**落地时的三层闸门**：

| 闸门 | 怎么配 | 效果 |
| --- | --- | --- |
| ① 服务器级白名单 | `"includeTools": ["confluence_search", "confluence_get_page", "confluence_create_page", "confluence_update_page"]` | delete 根本不出现在模型菜单里——最硬的一道 |
| ② 调用确认 | `trust: false`（默认） | 每次写操作人工过目确认框 |
| ③ 凭证权限 | 专用账号 + 只授权目标空间 | 前两道都失效时兜底 |

> 一句话总结：**模型永远不会增删改，它只是生成"请调用某某工具"的 JSON；
> 真正动手的始终是那个拿你 token 的服务器进程，中间隔着你的确认框。**

> 受限网络（装不了 uvx）的替代：Cloud 版 Confluence 可直接用 Atlassian
> 官方远程 MCP（`https://mcp.atlassian.com/v2/mcp`，HTTP + OAuth，无需本地
> 安装；旧 `/v1/sse` 端点 2026-06-30 后停用）；Server / DC 版无官方远程
> 方案，仍需本地进程。

> **常见疑问：为什么有的项目把 mcp 目录建在 `.gemini/` 里？**
> 官方并不存在 `.gemini/mcp/` 这个配置目录——Gemini CLI 不会扫描它，
> 建了也不生效。你看到的通常是三种情况：
>
> 1. 项目把**自研 MCP server 的代码**存放在该目录（无论项目里还是用户级
>    `~/.gemini/mcp/<名字>/`），再在 `settings.json` 里用路径引用；
>    目录只是代码仓库，配置仍在 `settings.json`——这是社区自创习惯，
>    全 GitHub 公开引用仅几十处；
> 2. 与 `~/.gemini/` 下官方自动生成的运行时文件混淆：
>    `mcp-oauth-tokens.json`（远程服务器 OAuth 令牌缓存）、
>    `mcp-server-enablement.json`（服务器启停状态）；
> 3. 与其他工具的约定混淆：VS Code 用 `.vscode/mcp.json`、Cursor 用
>    `.cursor/mcp.json`、标准 MCP 客户端用 `mcp_config.json`。
>
> 判断是否真的生效只有一个标准：`/mcp` 或 `gemini mcp list` 里有没有它。

### 放项目里还是放本地？—— 三问判断法

| 问题 | 是 | 否 |
| --- | --- | --- |
| 1. 团队每个人都要用吗？ | 项目级：`.gemini/settings.json`（进 git 共享） | 用户级：`~/.gemini/settings.json` 或 `gemini mcp add <name> <cmd> --scope user` |
| 2. 含个人凭证吗？ | 凭证**永远不进项目配置**：项目级只写服务器定义，用 `"env": { "TOKEN": "$MY_TOKEN" }` 引用环境变量；值放个人 `.env`（推荐，见下文「凭证落地」）或系统环境变量 | 可直接写完整配置 |
| 3. 和本项目强绑定吗？（项目专属文档空间、内部索引服务） | 项目级 | 用户级（GitHub、Confluence、Notion 等通用工具） |

**官方合并行为（已核对源码）**：

- 优先级链：默认值 < 用户设置 < 项目设置 < 系统设置（管理员）
  < 环境变量 < 命令行参数；
- `mcpServers` 采用**浅合并**：用户级与项目级的服务器同时生效、共存；
  同名服务器以项目级为准（整体覆盖，不逐字段合并）。
  → 因此「用户级放个人服务器 + 项目级放团队服务器」是最稳的分层，
  项目里写 `"mcpServers": {}` 也不会清掉你的用户级服务器；
- 设置内字符串支持环境变量引用：`$VAR`、`${VAR}`、`${VAR:-默认值}`。

**典型场景分层（以"代码改完生成 API 文档写入 Confluence"为例）**：

| 内容 | 放哪 | 理由 |
| --- | --- | --- |
| Confluence MCP 服务器定义 | 用户级（个人身份访问）或项目级（团队统一要求） | 定义本身不含密钥，可共享 |
| API Token / 账号 | 个人环境变量 | 每人凭证不同，永不进 git |
| 「改完代码跑 `/docs:confluence`」流程 | 项目级：命令 + GEMINI.md 规矩 | 团队协作规范应版本化 |
| 写入的目标空间 / 页面 ID | 项目级（命令参数或配置） | 与项目强绑定 |

> 写权限的服务器安全建议：不要开 `trust: true`（保留每次写入确认）；
> 用 `includeTools` 只暴露必要的写工具；Token 用最小权限的专用账号；
> 远程/HTTP 形式的 MCP 服务器务必加认证，不要裸暴露在网络
> （2026 年已有专门利用未认证 Confluence MCP 服务器的攻击链）。

### 凭证落地：用 .env 设置环境变量（推荐）

settings.json 里的 `"$CONFLUENCE_URL"` 只是**运行时的引用**——Gemini CLI
启动时才会从进程环境里取真实值。所以每个成员只需在自己机器上准备一份
`.env`，仓库里的配置就能直接跑；推荐做法如下：

**个人级（推荐）：`~/.gemini/.env`，Windows 为 `%USERPROFILE%\.gemini\.env`**

```ini
CONFLUENCE_URL=https://wiki.公司域名.com
CONFLUENCE_USERNAME=你的邮箱@公司.com
CONFLUENCE_API_TOKEN=xxxx
```

一份文件覆盖所有项目、永远不进任何仓库，个人 token 放这里最安全。

**项目级（备选）：项目根目录 `.env`** —— 适合团队共享的非敏感配置；
个人 token 别放这里（防误提交），并确保 `.gitignore` 已忽略它
（模板的 `.geminiignore` 已把 `.env` 从 AI 上下文排除）。

**加载顺序（已核对源码 `findEnvFile()`）**：从项目目录向上逐级查找，
每一级先看 `<目录>/.gemini/.env`、再看 `<目录>/.env`，**找到第一个就停**
（只加载一个文件，不合并多个）；一路到系统根目录都没有时，回退查
`~/.gemini/.env` → `~/.env`。

**优先级**：真实 shell 环境变量 > `.env`（仅当变量未设置时才用 `.env`
填充），两种做法混用时 setx 的值赢。

**替代做法：直接设系统环境变量**（不用 `.env` 时）：

| 场景 | Windows (cmd) | Windows (PowerShell) | macOS / Linux |
| --- | --- | --- | --- |
| 临时（仅当前窗口） | `set VAR=值` | `$env:VAR="值"` | `export VAR=值` |
| 持久（新开终端生效） | `setx VAR "值"` | `[Environment]::SetEnvironmentVariable("VAR","值","User")` | 写进 `~/.zshrc` |

**Windows 常见坑**：

- `setx` 写入用户注册表后，**已打开的终端不生效**，必须新开终端；
  VS Code 内置终端有时要完全重启 VS Code 才能拿到新值；
- `.gemini/.env` 只在**受信任工作区**加载（首次进入项目会弹信任确认）；
- settings.json 里的 `$VAR` / `${VAR}` 是跨平台语法，Windows 上**不用**
  改成 `%VAR%`（`%VAR%` 只是 Windows 专属的额外写法）；
- `.env` 每行 `KEY=value`，值不用加引号。

**验证**：填好 `.env` 后新开终端 → `gemini` → `/mcp`，服务器显示已连接
即生效。注意：只用 `.env` 时，终端里 `echo %VAR%` 看不到值是正常的——
shell 不读 `.env`，是 Gemini CLI 启动时自己加载的。

---

## 让 AI 把 docs 写得更好：最佳实践

1. **模板先行**。别让 AI「自由发挥」写文档——`docs/README.md` 的
   写作规范 + 各文档现有表格结构就是最好的约束。空项目先手工写下
   `error-codes.md` 的表头和一条示例码，AI 续写时会完全照抄风格。

2. **触发条件前置**。每篇文档开头写「何时需要更新本文档」，每条索引
   写「什么任务先读它」。AI 是概率驱动的，明确的触发条件显著提高
   它「主动去读」的概率。

3. **命令固化流程**。把「写文档、更新文档、体检文档」都变成命令
   （`/docs:new`、`/docs:update`、`/docs:audit`），每次执行步骤一致，
   不依赖当次对话的即兴提示。

4. **写进完成定义**。GEMINI.md 的「必守规矩」里明确：功能改动只有
   代码 + 文档同步才算完成。否则 AI 天然倾向于「代码跑通即收工」。

5. **先读后写、最小改动**。更新类命令（模板已内置）都要求：先读
   `docs/README.md` 规范 → 先读现有文档 → 只改与现状不符处。
   防止 AI 每次更新都大重排，产生无意义的 diff。

6. **事实与决策分离**。可验证的事实（函数名、错误码、目录）让 AI 写；
   设计决策（选型取舍）放 `architecture.md` 的「关键决策记录」表，
   要求注明原因和备选方案——AI 替代不了决策，但能帮你把决策记录规整。

7. **不确定就标注**。规范里写明：拿不准的事实标「待确认」，禁止编造。
   宁可留白，不可幻觉。

8. **人工审校不可省**。AI 生成的文档重点检查：路径是否存在、
   示例能否运行、数字/编号是否与代码一致。`/docs:audit` 能查出大部分
   漂移，但审计本身也是 AI 输出，定期抽检。

## 项目演进了怎么更新：维护手册

### 日常（每次功能开发）

| 时机 | 动作 | 用什么 |
| --- | --- | --- |
| 写代码前 | 查工具类清单、错误码规范 | AI 按 GEMINI.md「按需查阅」自动读 |
| 涉及新错误码 | 取号 + 登记 | `/code:error-code <描述>` |
| 功能改完、提交前 | 同步受影响文档 | `/docs:update` |
| 提交 | 规范提交信息 | `/git:commit` |

### 周期性（每周 / 每个里程碑）

- 跑一次 `/docs:audit`，处理 [事实错误] 与 [缺失] 两类；
- 手工改过 `GEMINI.md` 后 `/memory reload` 重载；
- 改过 `.geminiignore` 后重启会话生效。

### 项目结构大改时（重命名模块、换框架、加子系统）

1. 更新 `docs/architecture.md` 目录结构与模块表；
2. 检查受影响的子目录 `GEMINI.md`（JIT 文件）是否还准确；
3. 更新根 `GEMINI.md` 的简介、常用命令、按需查阅表；
4. 若产生新知识类别（如「部署」），建新文档并登记两级索引
   （`docs/README.md` + `GEMINI.md`）。

### Auto Memory（实验特性，可选）

开启后（`settings.json` 加 `"experimental": { "autoMemory": true }`），
Gemini CLI 会后台扫描**闲置 3 小时以上、至少 10 条用户消息**的旧会话，
自动挖掘两类候选：记忆补丁（.patch）和技能草稿（SKILL.md）。
候选不会自动生效，用 `/memory inbox` 审阅、决定采纳或丢弃。
适合：把「你反复教 AI 的同一件事」自动沉淀成技能。

---

## 命令速查

**会话内 Slash 命令**：

| 命令 | 作用 |
| --- | --- |
| `/memory show` / `/memory reload` | 查看 / 重载上下文文件 |
| `/memory inbox` | 审阅 Auto Memory 候选（需开启实验特性） |
| `/commands list` / `/commands reload` | 列出 / 热加载自定义命令 |
| `/skills list` / `/skills enable` / `/skills disable` | 技能管理 |
| `/agents list` / `/agents reload` | 列出 / 热加载子代理 |
| `@代理名 任务描述` | 强制把任务派给指定子代理 |
| `/mcp` | 查看 MCP 服务器连接与工具 |
| `/mcp auth` / `/mcp enable` / `/mcp disable` | OAuth 登录 / 临时启停服务器 |
| `/help` | 全部命令 |

**终端命令**：

| 命令 | 作用 |
| --- | --- |
| `gemini mcp add/list/remove/enable/disable` | MCP 服务器管理 |
| `gemini skills list/install/link/uninstall` | 技能管理 |
| `gemini extensions install/list/update/uninstall` | 扩展管理（打包技能+命令+MCP） |
| `gemini trust` | 信任当前文件夹（stdio MCP 未受信任时不连接） |

## 官方文档索引

以下文档位于官方仓库 `google-gemini/gemini-cli` 的 `docs/` 目录：

| 主题 | 文档路径 |
| --- | --- |
| GEMINI.md 上下文文件 | `docs/cli/gemini-md.md` |
| 设置参考（settings.json 全量） | `docs/reference/configuration.md` |
| MCP 服务器 | `docs/tools/mcp-server.md` |
| 自定义命令 | `docs/cli/custom-commands.md` |
| 技能总览 / 创建 / 最佳实践 | `docs/cli/skills.md`、`docs/cli/creating-skills.md`、`docs/cli/skills-best-practices.md` |
| 子代理（本地 / 远程） | `docs/core/subagents.md`、`docs/core/remote-agents.md` |
| Auto Memory | `docs/cli/auto-memory.md` |
| 忽略文件 | `docs/cli/gemini-ignore.md` |
| 导入处理器 | `docs/reference/memport.md` |
| CLI 命令参考 | `docs/cli/cli-reference.md` |
| 扩展 | `docs/extensions/index.md` |
