# Tasks: 健身打卡 API

**Input**: `specs/001-checkin-api/` 设计文档

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/checkin-api.md

## Phase 1: Setup

- [ ] T001 [P] 初始化项目：pyproject.toml（fastapi、uvicorn；dev: pytest、httpx）、`src/`、`tests/` 目录
- [ ] T002 [P] 配置 pytest 与临时 SQLite（每个测试函数独立 DB）

## Phase 2: Foundational

- [ ] T003 建表与 SQLite 接入：`src/checkin_api/models.py`（checkins/users 表、唯一约束、索引，见 data-model.md）
- [ ] T004 [P] 白名单加载与校验工具：`src/checkin_api/users.py`（读 users.yml）
- [ ] T005 [P] 上海时钟：`src/checkin_api/clock.py` 的 `today_shanghai()`（全项目唯一日期来源，支持测试替换）

**Checkpoint**: 存储、白名单、时钟就绪。

## Phase 3: User Story 1 - 提交每日打卡 (P1) 🎯 MVP

**Goal**: 合法打卡得 201，重复得 409，非法输入得 422 且不落库
**Independent Test**: POST 一条合法打卡得到 201 与日期；同日再 POST 得到 409

### Tests（先写，确认失败）

- [ ] T006 [P] [US1] 契约测试 201/409/422（含未来日期字段拒绝、未知 user_id、note 超长、缺字段）：`tests/contract/test_post_checkin.py`
- [ ] T007 [P] [US1] 集成测试：409 时库中仍只有一条记录：`tests/integration/test_idempotency.py`

### Implementation

- [ ] T008 [P] [US1] 请求/响应 schema 与校验：`src/checkin_api/schemas.py`
- [ ] T009 [US1] POST /check-ins 路由：`src/checkin_api/main.py`（IntegrityError → 409，依赖 T003/T004/T005/T008）

**Checkpoint**: T001–T009 即可交付 MVP（只含提交打卡）。

## Phase 4: User Story 2 - 按日期查询 (P2)

**Goal**: 支持 date 单查与 start/end 区间，升序、用户隔离、非法参数 422
**Independent Test**: 预置三天数据，区间查得 3 条升序；换用户得 0 条

### Tests（先写，确认失败）

- [ ] T010 [P] [US2] 契约测试：区间升序、单日、用户隔离、start>end/混用参数 422：`tests/contract/test_get_checkins.py`

### Implementation

- [ ] T011 [US2] 查询参数模型（date 与 start/end 互斥、顺序校验）：`src/checkin_api/schemas.py`
- [ ] T012 [US2] GET /check-ins 路由与查询：`src/checkin_api/main.py`、`src/checkin_api/models.py`

**Checkpoint**: US1 + US2 全部验收场景通过。

## Phase 5: Polish

- [ ] T013 [P] 按 quickstart.md 逐条实跑并修正文档
- [ ] T014 全量 pytest + 启动冒烟；执行 /speckit-converge 至 Converged

## Dependencies & Execution Order

- T001/T002 并行 → T003 →（T004、T005 并行）→ T006/T007（测试先红）→ T008 → T009 → T010（红）→ T011 → T012 → T013 → T014
- **P1 MVP 范围：T001–T009**

## Traceability

| spec 条目 | 任务 |
| --- | --- |
| FR-001 / US1 AS-1 | T006, T009 |
| FR-002 / US1 AS-2 | T007, T003（唯一约束）, T009 |
| FR-003 / US1 AS-3 | T006, T008 |
| FR-004, FR-005 / US2 AS-1,2,3,4 | T010, T011, T012 |
| FR-006 | T003, T009 |
| SC-001 | T014（冒烟观察，非功能断言） |
| SC-003 | T013 |
