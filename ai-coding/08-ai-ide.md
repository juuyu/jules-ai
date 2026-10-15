# 08 AI IDE 实战

> 本章解决：AI IDE 是什么、2026 年最流行的是哪些、怎么选，以及上手与用好。信息截至 2026-10-15，价格与功能以各官网为准。

## 8.1 科普：AI IDE 是什么

### 定义与特点

AI IDE = "代码编辑器 + 代码库索引 + 智能补全 + 对话 / Agent"做成一体。与另外两种形态的关系：

- **对编辑器插件**：AI IDE 是独立软件（多基于 VS Code 分支），能把补全、索引、Agent 做更深的一体化
- **对终端 Agent**：同一个任务，CLI 用命令行驱动（见 07 章），AI IDE 用图形界面驱动——Tab 补全、diff 面板、浏览器预览
- 2026 年界限在模糊：IDE 里内嵌 Agent 与插件，CLI 也出 IDE 插件，**选形态不如选生态**

### 2026-10 格局速览

| 产品 | 状态（2026-10） | 一句话定位 |
| --- | --- | --- |
| **Cursor** | 全球最流行的 AI IDE；2026-08 被 SpaceX 收购（公开报道），模型供应随之调整（低价档以 Grok 为主） | 生态最全的第一梯队 |
| **Antigravity（Google）** | 2026-05 重构为 2.0 四件套（桌面 / IDE / CLI / SDK），免费 | 免费 + Agent 优先，承接 Gemini CLI 免费用户 |
| **VS Code + Copilot** | 装机量最大；Agent HQ 统一多厂商 Agent（Claude、Codex 等已接入） | 不换编辑器的最稳方案 |
| **Trae（字节）** | 个人版免费；2026 年拆分为 TraeCode / TraeWork，有 SOLO 自主模式 | 国内直连 + 免费 |
| **Qoder（阿里）** | 官方称全球用户 600 万+（2026-09）；桌面 / 移动 / JetBrains / CLI 多端 | 国内生态 + 中文场景 |
| **Devin Desktop（原 Windsurf）** | 2026-06 更名，Cognition 旗下，$20/月起 | 老牌 Agent IDE 换壳 |
| **Kiro（AWS）** | Amazon Q Developer 于 2026-08-15 停止支持后由其接替 | AWS 生态 + spec 驱动（见 spec-coding） |
| **Zed** | 开源高性能编辑器，AI 按用量计费；JetBrains 另有 Air（预览） | 开源偏好 |

> 2026 年两个明显趋势：免费档普遍收缩（多家取消或缩减），MCP 与 Skills 成为标配能力。

## 8.2 怎么选（决策清单）

1. 想跟全球主流生态、要最成熟的 Agent 体验 → **Cursor**（留意模型供应变化）
2. 想免费体验 Agent 优先的新形态 → **Google Antigravity**
3. 国内网络 + 想要免费 → **Trae / Qoder**
4. 已深度使用 VS Code、不想迁移 → **GitHub Copilot**（Agent 模式）
5. AWS 系团队 → **Kiro**；开源洁癖 → **Zed**

## 8.3 教程：Cursor 主线（约 10 分钟上手）

### 安装与迁移

- 官网下载安装（VS Code 分支）：首次启动支持一键导入已有扩展、主题与快捷键，迁移成本低

### 三个核心入口

| 入口 | 快捷键（Mac / Win） | 用途 |
| --- | --- | --- |
| Tab 补全 | `Tab` | 多行、跨行补全与改写预测，写代码"顺手"的关键 |
| 行内编辑 | `Cmd+K` / `Ctrl+K` | 选中代码，用一句话描述改动 |
| Agent 面板 | `Cmd+I` / `Ctrl+I` | 多文件任务、跑命令、端到端改功能（以当前版本为准） |

### 第一次 Agent 任务

1. 打开项目，等代码库索引完成（右下角有进度）
2. 在 Agent 面板用 `@` 引用关键文件 / 目录，把需求说清楚（例："给设置页加暗色模式开关，沿用现有主题系统"）
3. **先要计划再执行**：让它列出改动方案，你确认后再 Apply
4. 审查 diff → 跑测试 / 浏览器预览验证 → 不满意就继续对话迭代

### 让它更懂你的项目：规则文件

- 项目规则放 `.cursor/rules/`；同时放置 **AGENTS.md**（跨工具标准，见 06 章）
- 规则内容：构建与测试命令、代码规范、目录约定、禁区（如"不要动迁移文件"）

### 进阶能力（2026 版本已有）

- 并行 Agent 与 Cloud Agents：长任务扔云端后台跑，本地继续干活
- Browser 工具：Agent 在浏览器里自测页面；MCP 接数据库与文档；Skills 沉淀流程
- 安全审查（Rollouts）：对 Agent 产出做额外把关

### 费用（2026-10 官网口径）

- Free 免费档；付费：Plus $8 / Premium $30 / Super $100 / Ultra $200（每月）
- 注意两点：Plus 档**仅含 Grok 模型**；Anthropic / OpenAI 等第三方模型从更高档位起按 API 原价计费

## 8.4 教程：国内与免费替代（简版上手）

### Antigravity（Google）

- 官网下载桌面端（Agent 优先）或 IDE 版；Google 登录即用，**免费档**
- 特色：多 Agent 编排（Agent Manager）、浏览器操控、Artifacts 结果评审；与 07 章的 Antigravity CLI 同源
- 适合：想零成本体验 2026 最新形态；注意闭源、数据走 Google 云

### Trae（字节）

- 官网下载，个人版免费，**国内直连无需代理**
- SOLO 模式可自主完成从需求到验证的完整任务；适合学生与个人开发者打底

### Qoder（阿里）

- 桌面 / JetBrains / CLI 多端；Agent 审批流、仓库级上下文理解，中文场景友好
- Free 免费档 + 订阅档（Pro 约 $20/月起、credits 制，以官网为准）

### VS Code + GitHub Copilot

- 已用 VS Code 的最低迁移成本方案：装扩展即得补全 + Agent 模式 + 云端 coding agent
- Agent HQ 可在 GitHub 上切换 Claude / Codex 等不同厂商 Agent 处理 issue

## 8.5 最佳实践

1. **规则文件先行**：AGENTS.md 已成跨工具统一标准（6 万+ 项目在用）。先把构建命令、规范、禁区写清楚，再让 Agent 干活（见 02 章）
2. **补全与 Agent 分工**：小改动、连续编辑交给 Tab / 行内编辑；多文件重构、新功能才上 Agent——用错入口是最常见的效率浪费
3. **计划 → 审查 → 应用**：永远先看计划与 diff 再点 Apply；Agent 写的东西你要能向别人讲清
4. **上下文靠索引 + 引用**：用 `@` 精确引用，别一次把整个仓库塞给模型；索引没完成前 Agent 容易找错文件
5. **验证闭环**：跑测试、用浏览器工具自检；关键改动人工复审（对 AI 产出的信任要靠验证赢得）
6. **模型选配**：规划 / 重构用强推理模型，补全用轻量模型，控制成本
7. **额度纪律**：免费档收缩是大势（2026 年多家调整），重度使用前先估额度、按需开档
8. **常见坑**：全盘接受 diff；把私有代码随意交给云端 Agent；只会"使唤"不懂产物——最后一条最贵，学不会就换不回成长

## 8.6 延伸

- 相关章节：[03 工具生态](./03-tools.md) · [04 工作流实践](./04-workflow.md) · [06 常用术语表](./06-glossary.md) · [07 终端 Agent 实战](./07-cli-agents.md)
- 官方入口：[cursor.com](https://cursor.com) · [antigravity.google](https://antigravity.google) · [trae.ai](https://www.trae.ai) · [qoder.com](https://qoder.com)
