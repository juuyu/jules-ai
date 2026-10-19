# 完整走查：从一句话需求到 PR

> 案例项目：**健身打卡 API**（FastAPI + SQLite，2 个用户故事）。
> 所有规格产物在 [`project-template/specs/001-checkin-api/`](./project-template/specs/001-checkin-api/) 可直接对照阅读；下文代码为教学示例，输出为预期结果（非真实运行记录）。
> 角色：**你**做决策与审查，AI 在斜杠命令里起草。每一步先回忆规则：[AI-DEVELOPMENT-RULES.md](./AI-DEVELOPMENT-RULES.md)。

---

## Step 0 · 初始化（一次性，5 分钟）

```bash
uv tool install specify-cli
specify init checkin-api --integration claude
cd checkin-api
```

拷入本模板的宪法、定制模板、AGENTS 与 PR 模板（命令见 [README 方式 A](./README.md#方式-a正式安装推荐需要-python-311-与-uv)），然后建功能分支——分支名不是随便起的，它就是 spec 头部声明的 Feature Branch：

```bash
git checkout -b 001-checkin-api
```

## Step 1 · 立宪法（项目一次）

**你发给 AI**：

```text
/speckit-constitution 读取 .specify/memory/constitution.md（已放团队模板），
结合本项目（单人后端服务、FastAPI）审阅：每条原则是否可检验？是否需要删改？
输出最终版，不要超过 5 条。
```

**AI 产出**：即模板里的 [constitution.md](./project-template/.specify/memory/constitution.md)（规格先行 / 测试为准 / 契约优先 / 简单与证据 / 增量可交付）。

**你做的审查（30 秒）**：每条原则能不能说出「违反时长什么样」？模板版已给出可观察表现，签字提交：

```bash
git add .specify AGENTS.md && git commit -m "chore: ratify constitution v1.0"
```

## Step 2 · 写规格（只谈 What/Why）

**你发给 AI**（用 6.2 提示词，需求只有两句话）：

```text
/speckit-specify 做一个健身打卡的后端：用户每天可以打卡一次记录运动，
还能按日期查自己的打卡历史。
```

AI 生成 `specs/001-checkin-api/spec.md` 草稿。**你对照三个闸门审查**：

1. 有没有技术词？（初稿写了「用数据库存」——让它改成「系统必须持久保存打卡记录」）
2. P1 故事单独是不是 MVP？（是：提交打卡无需查询也有价值）
3. 有没有拿不准的点？AI 标了 `[NEEDS CLARIFICATION: 时区？]` 和「客户端能否指定日期」。

你不必立刻回答全部——进入澄清。

## Step 3 · 澄清（按需，但这一步值回票价）

```text
/speckit-clarify 最多问 5 个最影响架构的问题。
```

AI 提问（节选）：

1. 「今天」按哪个时区？
2. 客户端能不能补卡/指定日期？
3. 一天能打几次？
4. 重复提交返回错误还是静默成功？
5. v1 要不要登录？

**你的决策**（这些只有你能拍板）：① 服务器 Asia/Shanghai；② 不能；③ 一次；④ 409 报错；⑤ 不做，白名单。AI 把结论回写 spec.md 并清掉所有 NEEDS CLARIFICATION。这正是示例 [spec.md](./project-template/specs/001-checkin-api/spec.md) 的 Edge Cases 与 FR-002/FR-003 的来历。

**签字点**：spec Status 改 Approved，单独提交（需求产物与代码分开，评审看得清）：

```bash
git add specs/001-checkin-api/spec.md
git commit -m "docs(spec): specify check-in API (US1 P1, US2 P2)"
```

## Step 4 · 出技术方案（这时才谈技术）

```text
/speckit-plan 技术约束：Python 3.12、FastAPI、SQLite、pytest。
```

AI 产出 `plan.md` + `research.md` + `data-model.md` + `contracts/checkin-api.md` + `quickstart.md`。

**你重点审三处**（对应 plan 闸门）：

- **Constitution Check**：5 条逐条有 ✓ 结论，不是一句话「符合宪法」；
- **验收场景映射表**：7 条 AS 全部能在契约里找到条目（见 plan.md 映射表）；
- **依赖与复杂度**：3 个依赖各有理由；研究记录 [research.md](./project-template/specs/001-checkin-api/research.md) 里 R4 选了「数据库唯一约束」而不是「先查后插」——这是真实的备选落选记录。

你发现一个问题：初稿把查询和创建塞进了同一个 service 类。审查时按宪法 IV 打回——两个端点不需要 service 层。AI 改后的结构决定写在 plan.md（「无 service 分层」并注明 YAGNI 理由）。**这就是人守门的价值：AI 默认会过度设计。**

## Step 5 · 拆任务（P1 切片必须清楚）

```text
/speckit-tasks
```

产出 [tasks.md](./project-template/specs/001-checkin-api/tasks.md)：T001–T009 是 P1 MVP，T010–T012 是 US2，每条任务有文件路径，测试任务在实现前。

**你的审查**：随机挑一条任务——「AI 能不能只凭这行字就知道在哪个文件写什么」。`T009 [US1] POST /check-ins 路由（src/checkin_api/main.py）` 通过；任何含糊的（「完善错误处理」）打回重写。

## Step 6 · 实现（一次一个 Phase，先红后绿）

### 6.1 先做 P1 的测试任务

```text
/speckit-implement 只实现 Phase 1、2 与 T006/T007（US1 测试任务），
先让测试失败，把失败输出贴给我，不要写路由实现。
```

关键纪律：这一轮**故意没有 main.py 路由**，pytest 结果应全红。预期输出（教学示例）：

```text
tests/contract/test_post_checkin.py:8: AssertionError: 404 != 201
7 failed, 0 passed in 36ms
```

看到红，再继续。

### 6.2 实现 US1

```text
/speckit-implement 实现 T008、T009 让 T006/T007 变绿，严格按契约的状态码与错误体。
```

AI 产出的核心代码（节选，对应任务文件路径）：

`src/checkin_api/clock.py`（全项目唯一的日期来源，research R3）：

```python
from datetime import datetime
from zoneinfo import ZoneInfo

def today_shanghai() -> "date":
    return datetime.now(ZoneInfo("Asia/Shanghai")).date()
```

`src/checkin_api/models.py`（幂等的最终裁决者，research R4）：

```python
# 建表时：UNIQUE(user_id, checkin_date)
# 插入冲突时抛出 sqlite3.IntegrityError
```

`src/checkin_api/main.py`：

```python
@app.post("/check-ins", status_code=201)
def create_check_in(body: CheckInCreate, session=Depends(get_session)):
    if body.user_id not in load_whitelist():
        raise RequestError(422, "unknown_user")
    row = insert_checkin(session, user_id=body.user_id,
                         checkin_date=today_shanghai(), note=body.note)
    if row is None:  # IntegrityError 已在 models 层翻译成 None
        raise RequestError(409, "already_checked_in")
    return row
```

测试转绿后按任务粒度提交（规则 §5）：

```bash
git add src tests && git commit -m "T008-T009: POST /check-ins with 201/409/422 contract"
```

**在这儿停下**：T001–T009 已构成 MVP，可以先跑一次 converge + 手动演示，再决定 US2。这就是增量交付。

### 6.3 实现 US2（同一个循环）

`/speckit-implement` 只做 T010（先红）→ T011、T012（转绿）→ 提交：

```bash
git commit -m "T010-T012: date/date-range query with user isolation"
```

## Step 7 · Converge（第一次通常不会过）

```text
/speckit-converge 逐条对照 spec 验收场景，只报告有证据的结论。
```

**第一次报告（示例——有缺口是常态，不是失败）**：

```text
US1 AS-1  已满足  tests/contract/test_post_checkin.py::test_create_201
US1 AS-2  已满足  test_duplicate_returns_409 + test_idempotency（库中仅 1 条）
US1 AS-3  已满足  未知 user_id/note 超长/缺字段 → 422
          ⚠ 缺口  「请求体携带日期字段 → 422」无测试对应（契约 §422 有此条）
US2 AS-1~4 已满足 T010 四项测试
Result: NOT CONVERGED — 1 gap
```

按规则：缺口只能靠补实现/测试消除，**不许手改报告**。

```text
/speckit-implement 补一条契约测试：请求体带 checkin_date 字段时返回 422；
若当前 schema 会静默吞掉多余字段，在 schemas.py 禁止 extra 字段。
```

修复后再 converge → **Converged**。然后 T013 实跑 quickstart（SC-003 的证据）、T014 全量测试：

```text
$ pytest -q
........                                      [100%]
8 passed in 0.4s
```

## Step 8 · 提交 PR

```bash
git push -u origin 001-checkin-api
gh pr create --fill   # 然后按模板手填，或让 AI 用 6.8 提示词起草
```

PR 正文（套用 [.github/pull_request_template.md](./project-template/.github/pull_request_template.md)，已填好的样子）：

```markdown
## Spec
- Spec: specs/001-checkin-api/spec.md
- Plan: specs/001-checkin-api/plan.md
- Tasks: specs/001-checkin-api/tasks.md
- Converge: 2026-10-19 第二次运行，Converged

## Motivation
健身用户需要每日打卡与历史回看。Fixes #12

## Changes
- 新增 POST /check-ins、GET /check-ins 两个 HTTP 端点；新增 checkins/users 两张 SQLite 表
- 用户可观察行为：提交打卡返回 201；同日重复返回 409；非法输入 422；可按日期查询本人记录

## Acceptance Mapping
| 验收场景 | 测试 | 结果 |
| --- | --- | --- |
| US1 AS-1 | test_create_201 | passed |
| US1 AS-2 | test_duplicate_409 + test_idempotency | passed |
| US1 AS-3 | test_validation_422（含日期字段拒绝） | passed |
| US2 AS-1 | test_range_ascending | passed |
| US2 AS-2 | test_single_date | passed |
| US2 AS-3 | test_user_isolation | passed |
| US2 AS-4 | test_invalid_range_422 | passed |

## Constitution Check
- [x] I. 规格先行（spec Approved 后才写产品代码）
- [x] II. 测试为准（测试先红；8 passed）
- [x] III. 契约优先（实现与 contracts/checkin-api.md 逐条一致）
- [x] IV. 简单与证据（3 依赖已在 plan 说明；无 service 层）
- [x] V. 增量可交付（T001–T009 曾作为 MVP 单独验证）

## Testing
- pytest -q（8 passed）；按 quickstart.md 手动验证提交/重复/查询
<details><summary>Proof</summary> pytest 输出与 curl 截图 </details>
```

## 全流程回顾

```text
你做的事：两句话需求 → 5 个业务决策 → 3 次审查打回（技术词越界/过度设计/任务含糊）
          → 看一次红 → 确认 Converged → 审 PR
AI 做的事：起草 7 份文档、写测试与代码、跑命令、报缺口
留痕：specs/001-checkin-api/ 全套 markdown + 带任务号的 commits + 验收映射的 PR
```

下一轮迭代（如「打卡连续天数统计」）：从 `/speckit-specify` 开新目录 `002-streak/`，宪法不动；发现统计需求要求打卡记录支持补卡时，**先改 001 的 spec 并让 plan/tasks 跟上**，再写代码。
