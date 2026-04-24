---
phase: "19"
plan: "01"
subsystem: planning-root-substrate
tags: [gsdcn, planning-root, brand-aware, sdk, cli, namespace-isolation]
dependency_graph:
  requires: []
  provides: [brand-aware-planning-root, cli-sdk-root-parity, namespace-contract-regression-suite]
  affects:
    - get-shit-done/bin/lib/core.cjs
    - sdk/src/context-engine.ts
    - sdk/src/workstream-utils.ts
tech_stack:
  added: [BRAND_ROOT_MAP, resolvePlanningRootName, GSD_BRAND-env-routing]
  patterns: [brand-aware-seam, backward-compatible-optional-parameter, cli-sdk-contract-parity]
key_files:
  created:
    - tests/planning-root-namespace.test.cjs
  modified:
    - get-shit-done/bin/lib/core.cjs
    - sdk/src/context-engine.ts
    - sdk/src/workstream-utils.ts
decisions:
  - "BRAND_ROOT_MAP is the shared contract: official -> .planning, gsdcn -> .planning-gsdcn"
  - "resolvePlanningRootName resolves brand by explicit arg, then GSD_BRAND env var, then official default"
  - "Existing callers remain backward compatible through optional brand parameters"
  - "CLI and SDK expose mirrored planning-root semantics to prevent state-root split"
metrics:
  duration: "not recorded"
  completed: "2026-04-23"
  tasks_completed: 3
  tests: "39 pass, 0 fail"
---

# Phase 19 Plan 01: Planning Root Substrate Summary

GSD-CN planning-root substrate 已落地：CLI 与 SDK 共享品牌感知状态根 contract，官方 GSD 默认继续使用 `.planning`，GSD-CN 使用 `.planning-gsdcn`，并通过 39 个回归测试锁定同工作区切换与跨品牌不串线边界。

## What Was Built

### Task 1: CLI planning-root 品牌解析 (commit fcfbcbd)

在 `get-shit-done/bin/lib/core.cjs` 中引入品牌感知规划根基础设施：

- 新增 `BRAND_ROOT_MAP`：`official -> .planning`，`gsdcn -> .planning-gsdcn`
- 新增 `resolvePlanningRootName(brand?)`：按 explicit arg > `GSD_BRAND` env > `official` 默认值解析
- `planningDir()` 增加可选第 4 个 `brand` 参数，保持既有调用兼容
- `planningRoot()` 增加可选第 2 个 `brand` 参数，保持既有调用兼容
- `findProjectRoot()` 与 `resolveWorktreeRoot()` 扫描所有已知 planning root，支持同工作区切换
- 从 `module.exports` 导出 `BRAND_ROOT_MAP` 与 `resolvePlanningRootName`

### Task 2: SDK path helper 对齐 (commit 95fc557)

在 SDK 路径层镜像 CLI contract：

- `sdk/src/workstream-utils.ts` 新增 `GsdbrandId` type、`BRAND_ROOT_MAP` 与 `resolvePlanningRootName()`
- `relPlanningPath()` 增加可选 `brand` 参数，默认行为不变
- `ContextEngine` 构造函数增加可选第 5 个 `brand` 参数
- `ContextEngine` 通过 `relPlanningPath(workstream, brand)` 派生 planning dir
- CLI 与 SDK 的 `BRAND_ROOT_MAP` 值保持一致，避免 `.planning` / `.planning-gsdcn` 状态根分裂

### Task 3: planning-root namespace 回归测试 (commit 4f96c59)

新增 `tests/planning-root-namespace.test.cjs`，39 个测试覆盖：

- 官方默认状态根为 `.planning`
- GSD-CN 状态根为 `.planning-gsdcn`
- `GSD_BRAND` env var 路由生效
- workstream、project + workstream 组合路径保持品牌隔离
- CLI 与 SDK `BRAND_ROOT_MAP` contract 一致
- 官方与 GSD-CN planning root 不重叠

验证命令记录为：`node --test tests/planning-root-namespace.test.cjs`，结果 `39 pass, 0 fail`。

## Requirement Coverage

| Requirement | Coverage |
|-------------|----------|
| CN-04 | ✓ COVERED — 官方 GSD 与 GSD-CN 使用不同 planning root |
| CN-05 | ✓ COVERED — 同工作区可按 brand 切换 `.planning` / `.planning-gsdcn` |
| CN-06 | ✓ COVERED — 行为变化限定为状态根命名空间选择，不改变默认 official 行为 |

## Evidence

- `fcfbcbd5` — CLI brand-aware planning-root resolver
- `95fc557f` — SDK path helper parity
- `4f96c593` — planning-root namespace regression tests

