# [PROJECT_NAME] Constitution
<!-- 通用版宪法：直接保留结构，替换 [PROJECT_NAME] 与不合用的条目；原则保持 ≤ 5 条、每条可检验。 -->

## Core Principles

### I. 规格先行（Spec First）

任何功能性产品代码变更必须先存在对应的 `specs/NNN-*/spec.md`，且经人工确认。
违反的可观察表现：分支 diff 出现功能代码，但 specs/ 下无对应 spec 或 spec 未经确认。
例外（修 bug、文案/配置/机械重构）必须在 PR 中注明类别。

### II. 测试为准（NON-NEGOTIABLE）

P1 用户故事的每条验收场景必须有自动化测试覆盖；测试先写并确认失败（Red），再实现到通过（Green）。
违反的可观察表现：验收场景在 PR 模板中映射不到任何测试；或实现先于测试提交。
测试不通过不得合并；不以删除断言的方式「修复」失败测试。

### III. 契约优先（Contract First）

对外接口（HTTP / CLI / 模块公共 API / 数据格式）先在 `contracts/` 中定义并被 spec 验收场景覆盖，再写实现；契约变更必须同 PR 更新文档与调用方。
违反的可观察表现：实现的路径、入参、响应、错误码与 contracts/ 不一致。

### IV. 简单与证据（Simplicity & Evidence）

YAGNI：不引入当前用户故事不需要的抽象、配置项与依赖。每个新依赖必须在 plan.md 中给一行理由并通过 Constitution Check；复杂度违例须填入 Complexity Tracking 表并说明更简单方案为何不可行。
完成声明必须附实际执行的命令与输出（测试、构建），自我报告不算证据。

### V. 增量可交付（Incremental Delivery）

任务按用户故事分组并标注优先级；P1 阶段单独构成可独立演示、可独立测试的 MVP。
违反的可观察表现：tasks.md 中不存在「只做编号范围 X 即可交付」的 P1 切片，或故事之间出现破坏独立性的硬依赖。

## Development Workflow

- 流程命令：`/speckit-*` 系列；一次只执行一个阶段，人工审查产物后再继续。
- 三层一致：变更需求时顺序固定为 spec.md → plan.md → tasks.md → 代码；用 `/speckit-analyze` 辅助核查。
- 分支：`NNN-feature-name`；提交粒度为单个任务，message 带任务号。
- 合并门禁：`/speckit-converge` 报告 Converged + 全量测试/构建通过 + PR 验收场景映射完整。

## Governance

宪法优先于项目内其他实践与 AI 生成的建议；与宪法冲突的方案必须先修宪（记录原因与日期）或放弃。
所有 PR 必须在 Plan 阶段与提 PR 前各做一次 Constitution Check；复杂度必须被证明，不接受「以后可能需要」。

**Version**: 1.0 | **Ratified**: [YYYY-MM-DD] | **Last Amended**: [YYYY-MM-DD]
