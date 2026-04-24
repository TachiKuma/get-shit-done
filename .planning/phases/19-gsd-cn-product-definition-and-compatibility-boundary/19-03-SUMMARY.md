---
phase: "19"
plan: "03"
subsystem: docs-help-surfaces
tags: [gsdcn, docs, help-surfaces, command-prefix, zh-CN, parity]
dependency_graph:
  requires: [19-01, 19-02]
  provides: [gsdcn-user-visible-surfaces, docs-prefix-contract, zh-cn-first-phase-boundary]
  affects:
    - README.md
    - docs/README.md
    - docs/COMMANDS.md
    - docs/USER-GUIDE.md
    - commands/gsd/*.md
    - get-shit-done/locales/en/claude-skills.json
tech_stack:
  added: [docs-gsdcn-prefix-contract, gsdcn-surface-parity, command-prefix-parity]
  patterns: [display-layer-only-change, structural-isomorphism, mixed-prefix-detection]
key_files:
  created:
    - tests/docs-gsdcn-prefix-contract.test.cjs
    - tests/gsdcn-surface-parity.test.cjs
    - tests/command-prefix-parity.test.cjs
  modified:
    - README.md
    - docs/README.md
    - docs/COMMANDS.md
    - docs/USER-GUIDE.md
    - commands/gsd/*.md
    - get-shit-done/locales/en/claude-skills.json
decisions:
  - "Root README and docs top-level narrative describe GSD-CN as an unofficial Simplified Chinese distribution"
  - "User-visible command examples use gsdcn prefix; canonical internal command file layout remains unchanged"
  - "Other languages are explicitly deferred; first phase scope is zh-CN only"
  - "Tests allow intentional coexistence comparison lines while rejecting accidental mixed /gsd- command references"
metrics:
  duration: "not recorded"
  completed: "2026-04-23"
  tasks_completed: 4
  tests: "53 pass; docs prefix contract file later backfilled in commit 0d5b7bba"
---

# Phase 19 Plan 03: README / Docs / Help Surfaces Summary

GSD-CN 用户可见叙事与命令入口已切换为中文发行版主线：README、docs、命令帮助与 skills 描述统一使用 `gsdcn` 前缀和 `zh-CN` 第一阶段边界，并通过 docs/help surface parity 测试防止混合前缀与行为漂移。

## What Was Built

### Task 1: 根 README 与 docs 主叙事切换 (commit 479f6e4)

将顶层文档从上游 GSD 叙事切换为 GSD-CN 中文发行版叙事：

- `README.md` 改为 GSD-CN 中文发行版主 README
- 明确上游来源、兼容边界与非官方说明
- 明确第一阶段仅承诺 `zh-CN`，其他语言 deferred
- `docs/README.md` 更新为 GSD-CN 文档索引
- `docs/USER-GUIDE.md` 标题更新为 GSD-CN 用户指南

### Task 2: 用户可见命令/help/install surfaces 前缀切换 (commit d172576)

将用户可见入口从 `/gsd-*` 切换为 `/gsdcn-*`：

- `docs/COMMANDS.md` 中命令示例与标题切换为 GSD-CN
- `commands/gsd/*.md` 中 34 个命令文件的用户可见引用切换为 `gsdcn`
- `get-shit-done/locales/en/claude-skills.json` 中描述值切换为 GSD-CN 命令前缀
- 保持目录结构与上游同构，仅改变显示层前缀与语言叙事

### Task 3: docs/help surface parity 测试 (commit ac25680)

新增并运行 docs/help surface contract 测试：

- `tests/gsdcn-surface-parity.test.cjs`：验证结构同构、语言 deferred 边界与 GSD-CN surface 约束
- `tests/command-prefix-parity.test.cjs`：验证 command source 与 docs 前缀一致
- README 共存说明改为 prose 格式，避免把官方 `/gsd-help` 作为可执行示例误判为 mixed-prefix
- 记录结果：53 tests pass

### Task 4: 遗漏 docs prefix contract 文件补交 (commit 0d5b7bba)

补交 `tests/docs-gsdcn-prefix-contract.test.cjs`：

- 20 个测试覆盖 `README.md`、`docs/COMMANDS.md`、`docs/USER-GUIDE.md`
- 锁定 `gsdcn` 前缀覆盖与 mixed-prefix 检测
- 提交说明记录该文件在 19-03 执行时已运行通过，但此前遗漏 `git add`

## Requirement Coverage

| Requirement | Coverage |
|-------------|----------|
| CN-01 | ✓ COVERED — README/docs 主线明确为 GSD-CN 中文发行版 |
| CN-02 | ✓ COVERED — 第一阶段范围锁定为 `zh-CN`，其他语言 deferred |
| CN-03 | ✓ COVERED — 用户可见命令/help/docs surfaces 使用 `gsdcn` 前缀 |
| CN-06 | ✓ COVERED — 测试约束结构同构，避免除显示层外的行为漂移 |
| CN-07 | ✓ COVERED — 文档包含独立中文发行叙事与共存边界说明 |

## Evidence

- `479f6e4b` — README/docs top-level GSD-CN narrative
- `d1725760` — user-visible command/help/install surfaces prefix update
- `ac25680c` — docs/help parity tests and mixed-prefix detection
- `0d5b7bba` — backfilled docs prefix contract test file

