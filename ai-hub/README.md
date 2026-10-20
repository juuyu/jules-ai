# AI Hub · 本地 AI 工具管理工作台

一个**纯本地**的 AI 资产管理工作台，前后端分离：前端为单文件 `ai-hub.html`（原生 HTML/CSS/JS，零依赖），后端为 Go 标准库实现的本地 HTTP 服务，所有数据保存在本机 `data/` 目录的文件中，**数据不出机器**。

界面采用 Claude 风格设计语言：暖米白纸感底色、陶土橘强调色、Lora 衬线标题，克制的微交互。支持**浅色 / 暗色双主题**：右上角月亮 / 太阳按钮一键切换，首次打开跟随系统偏好，选择持久保存在本地。

## 功能

| 模块 | 说明 |
|---|---|
| **看板** | 时段问候 + 日期、Skills / MCP / Prompts / Commands 统计卡片、快速连接（可增删整理）、常用工具直达入口 |
| **Skills** | Agent 技能包卡片管理：名称、描述、本地路径、标签、启用/停用开关、搜索与状态筛选 |
| **MCP 服务** | 服务列表 + 详情面板，实时预览 JSON 配置（语法高亮），一键复制到 `claude_desktop_config.json`；内置 Filesystem / GitHub / Fetch / SQLite / Playwright / Memory 六套配置模版 |
| **Prompts** | 提示词资产沉淀：分类管理、悬浮复制、行内编辑 |
| **Commands** | 斜杠命令管理，沉淀重复性指令 |
| **Docs** | 多级目录文档，**Markdown / JSON 双格式**：点击「新建笔记」弹出格式选择。Markdown：源码/预览、**块级所见即所得**（预览可解锁，点击区块就地编辑，Esc/失焦提交）、自动保存、全文搜索，新建自动生成 `description / tags / created` frontmatter 模板（created 为本地完整时间戳）；JSON：源码实时语法高亮、**页面内直接 Cmd+V 粘贴即自动快速格式化（无需点击）**、预览可解锁后点击节点编辑、添加/删除子节点、给任意节点加注释（注释独立存储不污染原始 JSON）、一键复制。目录树统一拖拽整理，JSON 文档带 `{ }` 图标 |
| **JSON 工具** | 两个子模块：快速格式化（格式化 / 压缩 / 转义 / 转义还原 / 复制，粘贴输入后自动格式化，输出带语法高亮；格式化输出为可折叠树，点击对象/数组括号收起展开，默认全展开；结果内关键字搜索，高亮全部匹配、Enter/Shift+Enter 上下跳转、自动展开命中节点）、结构化比对（递归 diff，差异标色） |
| **工具箱** | 常用 AI 工具统一入口，预置 14 个（对话 / 本地模型 / 创作 / 资源 / 自动化），支持分类筛选与自定义添加 |

### 快捷键

- `/` — 快速聚焦搜索框（只搜当前页面）
- `Esc` — 关闭弹窗

## 使用

需要 Go 1.19+，启动本地服务后用浏览器访问（前端页面已嵌入二进制，无需单独托管）：

```bash
cd ai-hub
go run ./cmd/aihub          # 默认监听 :8080，数据存 ./data
# 打开 http://localhost:8080
```

可选参数：

```bash
go run ./cmd/aihub -addr :9000 -data ~/aihub-data
```

> 直接双击 `ai-hub.html`（file://）不再支持数据持久化：页面会提示本地服务未连接，只能临时浏览示例数据。

## 压缩脚本

`minify.py`（与 `ai-hub.html` 同目录）可生成体积更小的分发副本：删除 HTML 注释、折叠冗余空白、压缩内联 CSS；**`<script>` 内容原样保留**（JS 含模板字符串，空白有语义，不做正则级压缩）。不改动源文件，仅用 Python 标准库，无任何依赖：

```bash
python3 minify.py                      # 默认: ai-hub.html -> ai-hub.min.html
python3 minify.py in.html -o out.html  # 指定输入 / 输出
```

运行结束打印压缩前后与 gzip 体积对比。压缩副本替换到服务端源文件位置（重新 `go run` 会重新嵌入）后功能一致；直接双击仅能临时浏览，不持久化。

## 数据与备份

- 业务数据全量保存在服务端 `data/aihub.json`（单次写入走临时文件 + rename 原子替换），首次启动自动写入示例数据
- 界面偏好（主题 / 侧栏收起 / Docs 目录树收起）保存在 `data/prefs.json`
- 旧版本 localStorage 数据：结构与导出备份一致，可在旧版页面「导出」后到新版「导入备份」
- 旧版本独立的「JSON 文档」数据会在首次加载时**自动合并**进 Docs 目录树（JSON 文档带 `{ }` 图标），无需手动处理
- 设置页 **导出备份**：下载 JSON 备份文件；**导入备份**：从备份文件恢复（整文件覆盖）
- 也可直接复制 / 备份 `data/aihub.json`

> ⚠️ **不要在浏览器中对该文件使用「另存为 / Cmd+S」保存回原路径** — 浏览器保存的是渲染后的 DOM 快照，会覆盖并损坏源码。编辑请使用代码编辑器。

## 自定义

- **快速连接 / 工具箱**：页面内直接增删改
- **MCP 模版**：编辑 `ai-hub.html` 中的 `TPL` 常量即可扩展模版
- **配色 / 字体**：文件头部 `:root` CSS 变量集中管理，暗色主题对应 `:root[data-theme="dark"]` 覆盖层
- **主题偏好**：保存在服务端 `data/prefs.json`，默认跟随系统深浅色设置

## 技术栈

- 前端：原生 HTML + CSS + JavaScript，无框架、无构建（仅 Google Fonts，断网时优雅降级为系统字体）
- 后端：Go 标准库 `net/http`，零第三方依赖；`ai-hub.html` 通过 `go:embed` 嵌入二进制
- 存储：本地 JSON 文件（`data/aihub.json`、`data/prefs.json`），互斥锁 + 原子写

### 目录结构

```
ai-hub/
├── ai-hub.html          # 前端单页
├── web.go               # go:embed 嵌入前端
├── cmd/aihub/main.go    # 服务入口（-addr / -data 参数）
├── internal/
│   ├── store/store.go   # 文件存储（原子写）
│   └── api/api.go       # HTTP 路由：/、/api/db、/api/state
└── data/                # 运行时生成，已 gitignore
```
