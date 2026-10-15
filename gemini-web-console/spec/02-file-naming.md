# 02 文件命名规范

> v0.1（2026-10-15）｜[规范总览](./README.md)

## 文件

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 普通 JS 模块 | kebab-case | `gemini-paths.js`、`json-file.js` |
| React 组件 | PascalCase，与组件同名 | `TerminalView.jsx`、`WorkspaceList.jsx` |
| 测试 | `<被测文件名>.test.js` | `gemini-paths.test.js` |
| 文档 | 编号前缀 + kebab-case + `.md` | `01-project-structure.md` |
| 配置 / 数据 | kebab-case | `workspaces.json` |

## 目录

- 一律小写单词、无分隔符（`api/`、`lib/`、`panels/`）
- 禁止无信息目录名（`temp/`、`misc/`、`new/`）

## 代码标识符

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 变量 / 函数 | camelCase | `sessionId`、`listWorkspaces()` |
| 类 / React 组件 | PascalCase | `TerminalManager` |
| 常量 | UPPER_SNAKE_CASE | `MAX_SCROLLBACK`、`DEFAULT_PORT` |
| 模块内私有 | 前缀 `_`（仅模块内部约定） | `_cache` |

## 语义规则

- 文件名必须表达职责：禁止 `utils.js`、`helpers.js`、`common.js`；工具按领域命名（`git.js`、`json-file.js`）
- 标识符用英文；界面文案用中文，两者不混
- 布尔值以 `is` / `has` / `can` / `should` 开头（`isReady`、`hasToken`）
- 函数以动词开头（`createSession`、`exportChat`）；返回布尔用 `is` / `has` / `check`
- 除公认缩写外不使用缩写（`api`、`id`、`url` 可用）；禁止自造缩写

## 项目专属约定

- tmux session 名：`ws-<workspaceId>`（与[技术方案](../docs/02-technical-design.md)一致）
- API 路径与 JSON 字段：camelCase（`workspaceId`）
- 错误码：UPPER_SNAKE_CASE（`WORKSPACE_NOT_FOUND`）
