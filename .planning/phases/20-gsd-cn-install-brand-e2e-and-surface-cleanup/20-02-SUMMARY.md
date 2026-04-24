---
phase: "20"
plan: "02"
subsystem: e2e-regression-coverage
tags: [gsdcn, e2e, regression, installer, state-root, cline]
dependency_graph:
  requires: [20-01]
  provides: [install-brand-e2e-test, state-root-e2e-test, runtime-surface-contract-test]
  affects:
    - tests/gsdcn-install-brand-e2e.test.cjs
    - tests/gsdcn-state-root-e2e.test.cjs
    - tests/gsdcn-runtime-surface-contract.test.cjs
requirements_completed: [CN-03, CN-04, CN-05, CN-07]
gaps_closed: [GAP-19-INSTALL-BRAND-ACTIVATION, GAP-19-STATE-ROOT-E2E, GAP-19-CLINE-SURFACE]
metrics:
  completed: "2026-04-24"
  focused_gate: "64 tests passed, 0 failed"
---

# Phase 20 Plan 02: E2E Regression Coverage Summary

新增三组 Phase 20 回归测试，覆盖 v2.0 audit 的三个 blocker gaps，并复跑相邻 Phase 19 guard tests。聚焦门禁结果：64 tests pass, 0 fail。

## Tests Added

| Test File | Covers | Gap |
|-----------|--------|-----|
| `tests/gsdcn-install-brand-e2e.test.cjs` | `--gsdcn` / `--brand gsdcn` 激活 gsdcn installer brand；README 首个安装命令不可含糊 | `GAP-19-INSTALL-BRAND-ACTIVATION` |
| `tests/gsdcn-state-root-e2e.test.cjs` | `GSD_BRAND=gsdcn` command-facing path 写入 `.planning-gsdcn`，official 默认仍写 `.planning` | `GAP-19-STATE-ROOT-E2E` |
| `tests/gsdcn-runtime-surface-contract.test.cjs` | Cline `.clinerules` 与安装完成提示使用 brand-aware command prefix / planning root | `GAP-19-CLINE-SURFACE` |

## Focused Gate Results

```bash
node --check bin/install.js
node --test tests/gsdcn-install-brand-e2e.test.cjs
node --test tests/gsdcn-state-root-e2e.test.cjs
node --test tests/gsdcn-runtime-surface-contract.test.cjs
node --test tests/runtime-install-layout-isolation.test.cjs
node --test tests/behavior-parity-boundary.test.cjs
```

Result: 64 tests passed, 0 failed.

## Noted Environment Issue

`node --test tests/planning-root-namespace.test.cjs` still reports `SDK dist not found` in this environment because `npm --prefix sdk run build` cannot find `tsc`. This is an existing environment/toolchain prerequisite, not a Phase 20 regression. The new state-root E2E test and behavior-parity suite both passed.
