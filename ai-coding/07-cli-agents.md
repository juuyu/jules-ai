# 07 终端 Agent 实战：Claude Code 与 Gemini CLI

> 本章解决：两个最流行的终端 Agent 怎么装、怎么用、怎么用好。信息截至 2026-10-15，命令、价格与模型清单以官方文档为准。

## 7.1 科普：终端 Agent 是什么

### 为什么用命令行

终端 Agent（CLI Agent）是跑在终端里的编程 Agent：给一句话任务，它自己读文件、改代码、跑命令、看结果再迭代。相比 IDE 和插件，优势在：

- **git 工作流原生**：改完直接 diff、commit，审查节奏自然
- **不挑环境**：SSH 到服务器、容器里、CI 里都能跑
- **可脚本化**：无头模式可以批量处理任务、接入自动化流水线
- 与编辑器插件互补：插件管"点"，CLI 管"面"

### 2026 年格局

- JetBrains 2026-08 开发者调查中，Claude Code 使用率约 39% 登顶（首次超过 GitHub Copilot，厂商自报口径）；开源侧 OpenCode 声势最大（见 03 章）
- 本章两个主角：
  - **Claude Code**：能力上限第一梯队，生态最全——skills、subagents、hooks、插件市场、MCP、多形态（终端 / 桌面 / Web / IDE 插件）俱全
  - **Google 系**：Gemini CLI 仍在持续更新（2026-10 最新 v0.64），但免费个人用户的终端入口已在 2026-06 迁往 **Antigravity CLI**——两家都要认识

## 7.2 教程 A：Claude Code 上手

### 安装与登录

```bash
# 原生安装器（推荐，自动更新）
curl -fsSL https://claude.ai/install.sh | bash

# 或 npm / Homebrew
npm install -g @anthropic-ai/claude-code
brew install --cask claude-code

claude    # 启动，浏览器登录
```

- **Windows 原生支持**：PowerShell 用 `irm https://claude.ai/install.ps1 | iex`
- 登录方式：Pro / Max 订阅（OAuth），或 API Key，或企业走 Bedrock / Vertex

### 五分钟走一遍

1. `cd 你的项目 && claude` 启动
2. 输入 `/init`：生成 `CLAUDE.md`（给 AI 的项目说明书，记得提交进 git）
3. 直接派活："给登录接口补集成测试"——它会自己搜代码、改文件、跑测试
4. `Shift+Tab` 切到**计划模式**：先看方案，你批准后再动手
5. 任务做完开新会话（`/clear`）；长会话快满时用 `/compact` 压缩

### 核心功能地图（2026-10）

| 功能 | 怎么用 | 一句话说明 |
| --- | --- | --- |
| 权限模式 | `Shift+Tab` 循环 / `/permissions` | 默认确认 → 自动接受编辑 → 计划模式 → 全放行（慎用）；另有 `/sandbox` 沙箱隔离命令执行 |
| CLAUDE.md 记忆 | `/init`、`/memory`、`@` 导入 | 分层生效：项目 → 用户 → 企业；2026 年起也兼容读 AGENTS.md |
| Skills 技能 | `.claude/skills/SKILL.md` | 把流程沉淀成可复用技能（自定义斜杠命令已并入技能体系） |
| Subagents 子代理 | `/agents` | 在独立上下文里跑子任务（探索、审查），只回传摘要 |
| Hooks 钩子 | settings.json 配置 | 生命周期事件回调：保存即格式化、危险命令先拦截 |
| Plugins 插件 | `/plugin` + marketplace | 技能 / 子代理 / 钩子 / MCP 的打包分发 |
| MCP | `claude mcp add` | 接外部工具与数据（原理见 05 章） |
| 检查点 | `/rewind` | 每轮自动快照，可回退代码与对话 |
| 后台任务 | `Ctrl+B` | 长命令转后台，不阻塞当前会话 |
| 无头 / CI | `claude -p "任务"` | 脚本化批量任务；GitHub Actions 用 claude-code-action |
| 其他形态 | Web / 桌面 / 移动 | claude.ai/code 云端会话；桌面应用支持并行会话与浏览器面板 |

### 快捷键小抄

| 按键 | 作用 |
| --- | --- |
| `Esc` | 停止当前回复 |
| `Shift+Tab` | 循环切换权限模式 |
| `Ctrl+B` | 当前任务转后台 |
| `Ctrl+T` | 查看任务清单 |
| `Ctrl+O` | 查看完整对话记录 |
| `Ctrl+C` / `Ctrl+D` | 中断 / 退出 |

### 费用（2026-10）

- Pro：月付 $20，年付约合 $17/月；Max：$100/月起（分档进位）
- 订阅内含额度，超出后可用额外用量点数（`/usage` 查看消耗）；也可 API 按量计费

## 7.3 教程 B：Gemini CLI 系（含 Antigravity CLI）

### 先把现状说清楚

- **Gemini CLI 没有停**：仓库每日更新（最新 v0.64，2026-10-13，约 10.7 万 star），仍服务付费订阅、API Key、企业用户
- **但免费个人入口已迁移**：2026-06-18 起，Google 把免费个人用户的终端 Agent 换成了 **Antigravity CLI**（官方公告口径）——想免费用 Google 系，装它

### 免费路线：Antigravity CLI

```bash
curl -fsSL https://antigravity.google/cli/install.sh | bash
agy    # 启动，Google 登录即可用，随账号提供免费额度
```

- Go 编写、启动快；与 Antigravity 桌面端 / IDE / SDK **共享同一 Agent 运行时**（配置、技能互通）
- 支持插件市场，例如 `/plugin install firebase@agent-marketplace`
- 注意：目前闭源（无开源协议），与 Gemini CLI 的 Apache 2.0 不同

### 付费 / API 路线：Gemini CLI

```bash
npx @google/gemini-cli                # 免安装体验
npm install -g @google/gemini-cli     # 或 brew install gemini-cli
gemini                                # 启动
```

- `/init` 生成 GEMINI.md（规则文件），`/memory` 管理
- `/model` 切换模型（以当前可选清单为准），`/plan` 计划模式，`/mcp`、`/extensions`、`/skills`
- 官方配额页口径（与迁移公告存在出入，以官方为准）：个人档约 1,000 请求/天、AI Pro 1,500、Ultra 2,000；API Key 免费档 250/天（仅 Flash 系）

### 两个怎么选

| 你的情况 | 建议 |
| --- | --- |
| 免费个人使用 | Antigravity CLI（`agy`） |
| 有 Gemini API Key 或企业 Code Assist | Gemini CLI（仍在维护） |
| 已订阅 Claude 或想要最全生态 | Claude Code |
| 偏好开源 | OpenCode、Kimi Code 等（见 03 章） |

## 7.4 最佳实践

### 通用（两家官方文档 + 社区共识）

1. **固定工作流**：探索 → 计划 → 编码 → 提交。官方 best practices 的核心就这一条：先让它读代码出计划，你批准，再动手
2. **上下文纪律**：任务边界即会话边界——做完就 `/clear`，长任务中途 `/compact`；不要让一个会话从早跑到晚（会变笨、变贵）
3. **规则文件要短**：CLAUDE.md / GEMINI.md 只写"构建命令 + 代码约定 + 禁区"，`/init` 生成后手动删废话，随踩坑持续更新（写法见 02 章）
4. **计划模式先行**：中大型改动先看方案再放行，改错方向的成本远高于多聊一轮
5. **验证回路**：改完让它自己跑测试、贴结果；截图类任务让它看截图。"应该能跑"一律不信
6. **并行与自动化**：用 git worktree 开多个会话 / 子代理互不干扰；重复性任务用无头模式 `-p` 脚本化
7. **权限与安全**：默认人工确认 + 沙箱；全放行模式只在容器里用；密钥不进对话（见 04 章安全节）

### Claude Code 专属

- 大项目先 `/init` 摸清结构，再把 CLAUDE.md 补成"项目导览"
- 探索型任务拆给 subagents（隔离上下文、并行找答案），主会话保持干净
- 强制约束用 hooks（比写在 CLAUDE.md 里的"建议"硬）

### Gemini CLI 专属

- `/init` 后精简 GEMINI.md，用 `@file:line` 精准引用文件
- 开启检查点与沙箱、配置可信目录，再放开自动执行

## 7.5 延伸

- 官方文档：[code.claude.com/docs](https://code.claude.com/docs/en/overview)（含中文版）· [geminicli.com/docs](https://www.geminicli.com/docs) · [antigravity.google](https://antigravity.google)
- 相关章节：[03 工具生态](./03-tools.md) · [04 工作流实践](./04-workflow.md) · [05 进阶方向](./05-advanced.md) · [06 常用术语表](./06-glossary.md)
