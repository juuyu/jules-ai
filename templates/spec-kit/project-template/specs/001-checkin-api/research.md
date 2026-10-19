# Research: 健身打卡 API

> Phase 0 选型记录。只记录真实考虑过的选项与落选原因。

## R1. Web 框架：FastAPI vs Flask

**选 FastAPI。**

- Pydantic 原生承担 FR-003 的请求体校验，422 响应与错误明细不用手写；
- OpenAPI 文档自带，便于后续功能对接；
- Flask + marshmatcher/pydantic 也能实现，但要自己组装校验与错误格式，组件更多，违背宪法 IV。

**落选**：Flask——本功能边界全部是 JSON 校验场景，FastAPI 的契合度直接删掉一层自有代码。

## R2. 存储：SQLite vs Postgres

**选 SQLite（单文件）。**

- v1 规模 < 1k 用户、单实例（plan 已声明），唯一约束与日期查询都是 SQLite 直接能力；
- 零运维，quickstart 不需要任何外部服务，服务 SC-003（10 分钟跑通）。

**落选**：Postgres——当前没有并发写入规模与多实例需求；将来上量时数据访问集中在 `models.py`，迁移成本可控。该假设写入 spec Assumptions。

## R3. 「今天」的判定

**选服务器时区 Asia/Shanghai，客户端不能指定日期。**

- spec Edge Cases 已裁定；实现上所有日期从 `clock.today_shanghai()` 一个函数取，端点不得直接调用 `date.today()`（后者依赖宿主机时区）；
- 测试通过替换该函数注入固定日期，不依赖测试运行环境的时区。

**落选**：客户端传日期——FR-002 的幂等约束会被客户端伪造绕过（US1 AS-3 的未来日期问题只是其一）。

## R4. 幂等实现：应用层先查后插 vs 数据库唯一约束

**选数据库唯一约束 `UNIQUE(user_id, checkin_date)` + 应用层捕获 IntegrityError 转 409。**

- 先查后插在并发下存在竞态（两个请求同时查不到、同时插入）；
- 唯一约束是竞态的最终裁决者，应用层翻译错误即可。

## R5. 不做的事（明确放弃）

- 不做注册/鉴权（白名单 user_id 配置文件）；
- 不做分页——v1 单人全量打卡一年也就 366 行；
- 不做软删除与编辑——需求未出现；
- 不做 Docker 镜像——quickstart 直接 uvicorn 启动。
