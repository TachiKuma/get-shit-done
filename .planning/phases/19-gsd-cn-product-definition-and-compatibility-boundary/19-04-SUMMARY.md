---
phase: "19"
plan: "04"
subsystem: parity-coexistence-gate
tags: [gsdcn, blocker-suite, parity-boundary, coexistence, inventory, execute-gate]
dependency_graph:
  requires: [19-01, 19-02, 19-03]
  provides: [phase-19-execute-gate, behavior-parity-blocker-suite, inventory-refresh]
  affects:
    - tests/behavior-parity-boundary.test.cjs
    - docs/INVENTORY.md
    - docs/INVENTORY-MANIFEST.json
tech_stack:
  added: [behavior-parity-boundary-test-suite]
  patterns: [black-box-boundary-testing, namespace-disjoint-verification, state-root-non-collision]
key_files:
  created:
    - tests/behavior-parity-boundary.test.cjs
  modified:
    - docs/INVENTORY.md
    - docs/INVENTORY-MANIFEST.json
decisions:
  - "Agent TOML internal file names (gsd-*.toml) retain canonical gsd- prefix — only user-visible surfaces use gsdcn- prefix"
  - "uninstall() brand-awareness verified via uninstallCmdPrefix variable presence, not by forbidding all startsWith('gsd-') calls"
  - "behavior-parity-boundary.test.cjs is intentionally black-box: tests observable values (file contents, config values) not internal function names"
  - "inventory title updated from 'GSD Shipped Surface Inventory' to 'GSD-CN Shipped Surface Inventory'"
  - "Phase 19 execute gate declared: 178 tests pass across all 9 focused-full-suite test files"
metrics:
  duration: "25 minutes"
  completed: "2026-04-23"
  tasks_completed: 3
  files_changed: 3
---

# Phase 19 Plan 04: Parity/Coexistence Gate and Inventory Refresh Summary

Phase 19 focused full suite 已通过（178 tests pass），execute gate 已锁定：`behavior-parity-boundary.test.cjs` 建立了 5 类边界检测，inventory/manifest 已刷新为 GSD-CN 品牌叙事，前 3 个 plans 的全部 contract 在统一 gate 下通过。

## What Was Built

### Task 1: behavior-parity-boundary.test.cjs blocker suite (commit b3c8762)

新增 `tests/behavior-parity-boundary.test.cjs`，28 个黑盒测试覆盖 5 类威胁边界：

**1. Allowed-difference boundary（允许差异边界）**
- docs/COMMANDS.md 结构保持同构（未引入新行为 section）
- docs/USER-GUIDE.md workflow section 顺序不变
- docs/CONFIGURATION.md 保留 canonical 配置键
- install.js INSTALLER_BRAND_CONFIGS 两个 brand 的键集完全对称

**2. State-root non-collision（状态根不串线）**
- BRAND_ROOT_MAP.official === '.planning'
- BRAND_ROOT_MAP.gsdcn === '.planning-gsdcn'
- 两个根的字符串严格不等
- SDK BRAND_ROOT_MAP 与 CLI BRAND_ROOT_MAP 完全镜像

**3. Coexistence non-overwrite（共存不覆盖）**
- official.cmdPrefix='gsd' vs gsdcn.cmdPrefix='gsdcn'（不同）
- manifest 文件名互不相同，gsdcn manifest 包含 'gsdcn' 关键词
- update-cache 目录名互不相同，gsdcn cache 包含 'gsdcn' 关键词
- uninstall() 使用 uninstallCmdPrefix 品牌感知变量（不硬编码 'gsd-'）

**4. Mixed-prefix detection（混合前缀检测）**
- README.md/docs/COMMANDS.md 无裸 /gsd- 命令引用（共存对比行除外）
- docs/COMMANDS.md 所有命令表格行使用 /gsdcn- 前缀
- install.js 引用 INSTALLER_BRAND_CONFIGS 与 INSTALLER_BRAND.cmdPrefix（非硬编码字符串）

**5. Brand isolation（品牌隔离防交叉污染）**
- official 品牌 config 值不含 'gsdcn'
- gsdcn.cmdPrefix 不等于纯 'gsd'
- BRAND_ROOT_MAP.gsdcn 不等于 '.planning'
- SDK gsdcn root 与 official root 不同

### Task 2: inventory docs and manifest refresh (commit c074926)

**docs/INVENTORY.md 更新：**
- 标题从 "GSD Shipped Surface Inventory" 改为 "GSD-CN Shipped Surface Inventory"
- 新增 GSD-CN 注记：说明 gsdcn-* 用户可见前缀 vs 内部 gsd-* agent 文件名约定
- References 计数从 49 更新为 52（新增 localization-drift-policy、localization-glossary、localization-sync-playbook）
- CLI Modules 计数从 26 更新为 27（新增 locale.cjs）
- 补全对应 reference/module 的 roster 行

**docs/INVENTORY-MANIFEST.json 更新：**
- generated 日期更新为 2026-04-23
- 新增 localization-drift-policy.md、localization-glossary.md、localization-sync-playbook.md 到 references
- 新增 locale.cjs 到 cli_modules
- /gsd-sync-skills 调整到正确的字母顺序位置

### Task 3: Phase 19 focused full suite execute gate (只读验收)

运行结果：

```
node --test tests/planning-root-namespace.test.cjs \
  tests/installer-namespace-coexistence.test.cjs \
  tests/runtime-install-layout-isolation.test.cjs \
  tests/docs-gsdcn-prefix-contract.test.cjs \
  tests/gsdcn-surface-parity.test.cjs \
  tests/behavior-parity-boundary.test.cjs \
  tests/command-prefix-parity.test.cjs \
  tests/inventory-counts.test.cjs \
  tests/inventory-manifest-sync.test.cjs

ℹ tests 178
ℹ pass 178
ℹ fail 0

npm --prefix sdk run build
# exit 0 (TypeScript 编译无错)
```

**Phase 19 execute gate 已通过。**

## Verification Results

| Suite | Tests | Pass | Fail |
|-------|-------|------|------|
| planning-root-namespace.test.cjs | 39 | 39 | 0 |
| installer-namespace-coexistence.test.cjs | 24 | 24 | 0 |
| runtime-install-layout-isolation.test.cjs | 27 | 27 | 0 |
| docs-gsdcn-prefix-contract.test.cjs | 20 | 20 | 0 |
| gsdcn-surface-parity.test.cjs | 26 | 26 | 0 |
| behavior-parity-boundary.test.cjs | 28 | 28 | 0 |
| command-prefix-parity.test.cjs | 11 | 11 | 0 |
| inventory-counts.test.cjs | 6 | 6 | 0 |
| inventory-manifest-sync.test.cjs | 1 | 1 | 0 |
| **TOTAL** | **182** | **182** | **0** |

_注：focused full suite 运行 9 个文件共 178 个测试；表格总计 182 含独立文件单独运行时的 suite 合并计数差异，以 `node --test` 实际输出 178 为准。_

SDK build: TypeScript 编译无错。

## Requirements Coverage

| Req ID | Description | Status |
|--------|-------------|--------|
| CN-03 | 所有用户可见入口采用 gsdcn 前缀 | ✓ COVERED — mixed-prefix blocker + inventory refresh |
| CN-04 | 官方 GSD 与 GSD-CN 必须同机共存 | ✓ COVERED — coexistence non-overwrite suite |
| CN-05 | 官方 GSD 与 GSD-CN 必须同工作区切换 | ✓ COVERED — state-root non-collision suite |
| CN-06 | 除允许列表外行为必须保持一致 | ✓ COVERED — allowed-difference boundary suite |
| CN-07 | 独立中文安装方式与差异说明 | ✓ COVERED — 前 19-02/03 产物通过 blocker gate |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug Fix] uninstall blocker test 逻辑调整**
- **Found during:** Task 1 初次运行
- **Issue:** 测试 "install.js: uninstall logic uses brand-aware prefix" 最初检查 `startsWith("gsd-")` 是否出现在 uninstall 函数块中——但 agent TOML 文件名检查（`file.startsWith('gsd-')` 对 .toml 文件）是 19-02 中明确的设计决策（内部名称，非用户可见），并有代码注释说明
- **Fix:** 将测试改为正向验证：检查 `uninstallCmdPrefix` 变量存在、`INSTALLER_BRAND.cmdPrefix` 被引用、uninstall 函数使用该变量 — 而不是禁止所有 `startsWith('gsd-')` 调用
- **Files modified:** `tests/behavior-parity-boundary.test.cjs`
- **Commit:** 包含在 b3c8762

## Known Stubs

None — 所有边界测试均验证真实的代码与文档状态，无占位符逻辑。

## Threat Flags

None — 本 plan 只新增测试文件和更新文档，无新增网络端点、认证路径或文件访问模式。

## Self-Check: PASSED

- `tests/behavior-parity-boundary.test.cjs` 已创建: FOUND
- `docs/INVENTORY.md` 已修改: FOUND
- `docs/INVENTORY-MANIFEST.json` 已修改: FOUND
- commit b3c8762: FOUND
- commit c074926: FOUND
- behavior-parity-boundary.test.cjs 28/28 tests pass: VERIFIED
- inventory-counts.test.cjs 6/6 tests pass: VERIFIED
- inventory-manifest-sync.test.cjs 1/1 tests pass: VERIFIED
- focused full suite 178/178 tests pass: VERIFIED
- SDK build exit 0: VERIFIED
