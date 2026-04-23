---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: GSD-CN 中文发行版基线
status: executing
stopped_at: Phase 19 Plan 02 complete — installer namespace substrate delivered
last_updated: "2026-04-23T09:19:00Z"
last_activity: 2026-04-23 — 19-02 installer/runtime namespace isolation complete (51 tests pass)
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 4
  completed_plans: 2
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-23)

**Core value:** 中文用户可以直接使用默认简体中文的 `GSD-CN`，同时保持与上游 GSD 的行为一致性和共存能力
**Current focus:** v2.0 `GSD-CN` 主线已完成 Phase 19 planning，下一步进入执行阶段，落地 `.planning-gsdcn`、`gsdcn` 前缀与共存隔离

## Current Position

Phase: Phase 19 (EXECUTING)
Plan: 19-02 complete — next is 19-03 (README/docs/help surfaces)
Status: executing; 19-01 and 19-02 delivered; planning-root substrate + installer namespace isolation complete
Last activity: 2026-04-23 — 19-02 installer/runtime namespace isolation complete (51 tests pass)

Progress: [█████████████ ] 96% (51/53 plans complete)

## Performance Metrics

**Latest shipped milestone:**

- v1.2 — 4 phases / 11 plans / 25 tasks
- Timeline: 2 days (2026-04-20 -> 2026-04-21)
- Audit: passed
- Nyquist: compliant

**Project totals:**

- Completed milestones: 3 (`v1.0`, `v1.1`, `v1.2`)
- Completed phases: 17
- Completed plans: 49

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

Latest locked context:

- 项目主线已切换为 `GSD-CN`，定位为上游 `get-shit-done` 的非官方简体中文发行版
- 新主线要求所有用户可见入口统一改为 `gsdcn` 前缀，不允许半迁移
- 第一阶段只承诺 `zh-CN` 中文发行版，其他语言支持全部 deferred
- 官方 `GSD` 与 `GSD-CN` 必须同时满足同机共存与同工作区切换
- 行为差异仅允许出现在显示文案、注释、默认语言与命令前缀层面
- 非用户可见层尽量保持不动，除非为满足共存硬约束不得不改
- CCB 特化只记录为 deferred roadmap item，不进入当前 milestone scope
- Phase 19 已拆分为 4 个执行 plans：planning-root substrate、installer namespace、docs/help surfaces、parity/coexistence gate
- 19-01 (planning-root substrate) 已完成：BRAND_ROOT_MAP + resolvePlanningRootName + SDK 对齐，39 tests pass
- 19-02 (installer namespace) 已完成：INSTALLER_BRAND_CONFIGS + resolveInstallerBrand + uninstall 隔离，51 tests pass

### Roadmap Evolution

- v1.0-v1.2 作为已交付基础能力保留
- v1.3 不再作为当前 active mainline；其 evidence-gap closure 保留为 superseded context
- v2.0 作为新的 active milestone 启动，首个 phase 为 Phase 19：`GSD-CN` 产品定义与兼容边界锁定
- Phase 19 已完成 planning，下一步进入 execute-phase

### Pending Todos

- 执行 19-03: README/docs/help surfaces 收口（中文主叙事 + gsdcn 用户入口 + zh-CN 边界说明）
- 执行 19-04: parity/coexistence regression gate（blocker suite + inventory/manifests 刷新）

### Blockers/Concerns

- `gsdcn` 前缀要覆盖所有用户可见入口，实施面会比单纯命令重命名更广
- `.planning` / `.planning-gsdcn` 双根需要同时覆盖 CLI 与 SDK，否则同工作区切换会失效
- “行为完全一致”是硬约束，执行阶段必须防止为了共存而引入行为漂移
- v1.3 superseded context 仍在仓库历史中，后续文档更新要避免叙事混杂

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Locale parity | `ja-JP` / `ko-KR` / `pt-BR` 的同步发行 | Deferred | 2026-04-23 |
| CCB specialization | 面向 CCB 的多 AI 环境深度特化 | Deferred | 2026-04-23 |
| Behavior fork | 脱离上游的功能增强或行为分叉 | Rejected for current milestone | 2026-04-23 |

## Session Continuity

Last session: 2026-04-23T09:19:00Z
Stopped at: Phase 19 Plan 02 complete — installer namespace substrate delivered
Resume with: /gsd-execute-phase 19 (continue with 19-03)
