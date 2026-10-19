# Implementation Plan: 健身打卡 API

**Branch**: `001-checkin-api` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-checkin-api/spec.md`

## Summary

以 Python 3.12 + FastAPI 提供打卡 JSON API，SQLite 单文件存储；日期一律由服务器按 Asia/Shanghai 计算，数据库层对 `(user_id, checkin_date)` 加唯一约束实现幂等。

## Technical Context

**Language/Version**: Python 3.12

**Primary Dependencies**: fastapi（HTTP 层与校验）、uvicorn（开发服务器）、pytest + httpx（测试）

**Storage**: SQLite（单文件 `checkins.db`，单机部署）

**Testing**: pytest（contract + integration 分层）

**Target Platform**: Linux/macOS server

**Project Type**: web-service（单项目：src/ + tests/）

**Performance Goals**: 创建打卡 p95 < 200ms（SC-001）

**Constraints**: 部署时区固定 Asia/Shanghai

**Scale/Scope**: v1 单实例、白名单用户 < 1k

### 新增依赖理由

| 依赖 | 解决什么 | 不引入它的代价 |
| --- | --- | --- |
| fastapi | 路由 + Pydantic 校验 + OpenAPI | 用标准库需手写请求解析与 422 响应，重复造轮且易漏边界 |
| uvicorn | ASGI 运行 | FastAPI 官方配套，无等价标准库方案 |
| httpx | 测试中发真实 HTTP 请求 | 只测内部函数会绕过路由/校验层，违背契约测试目的 |

## Constitution Check

- ✓ I. 规格先行：spec.md 已人工 Approved；本方案逐条引用其 FR 编号
- ✓ II. 测试为准：每个验收场景在 tasks.md 有先写的测试任务（T005–T010）
- ✓ III. 契约优先：[contracts/checkin-api.md](./contracts/checkin-api.md) 覆盖全部 AS，映射见下
- ✓ IV. 简单与证据：仅 3 个直接依赖且各自有理由；无额外抽象；证据随 PR 提交
- ✓ V. 增量可交付：T001–T009 完成 US1 即为 MVP，US2（T010–T012）独立增量

### 验收场景 → 契约映射

| spec 验收场景 | contracts/ 条目 |
| --- | --- |
| US1 AS-1 创建成功 201 | POST /check-ins §201 |
| US1 AS-2 重复 409 | POST /check-ins §409 |
| US1 AS-3 未来日期/非法体 422 | POST /check-ins §422 |
| US2 AS-1 区间查询升序 | GET /check-ins §200-range |
| US2 AS-2 单日查询 | GET /check-ins §200-date |
| US2 AS-3 用户隔离 | GET /check-ins §isolation |
| US2 AS-4 start>end 422 | GET /check-ins §422-range |

## Project Structure

### Documentation (this feature)

```text
specs/001-checkin-api/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/checkin-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/checkin_api/
├── main.py          # FastAPI 应用与路由
├── models.py        # CheckIn 表与 SQLite 接入
├── schemas.py       # 请求/响应模型与校验
└── clock.py         # Asia/Shanghai 当天日期（唯一时间来源）
tests/
├── contract/test_api.py      # 逐条验收场景
└── integration/test_flow.py  # 提交→查询全链路
```

**Structure Decision**: 单项目 web-service；无 service 分层——当前只有两个端点，额外分层属于 YAGNI（宪法 IV）；`clock.py` 单独成文件是为了让「服务器日期」只有一个事实来源，测试可替换。

## Complexity Tracking

> 无违例。
