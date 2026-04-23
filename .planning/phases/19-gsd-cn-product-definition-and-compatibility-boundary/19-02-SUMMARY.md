---
phase: "19"
plan: "02"
subsystem: installer-namespace-substrate
tags: [gsdcn, installer, brand-aware, coexistence, namespace-isolation, update-cache]
dependency_graph:
  requires: [19-01]
  provides: [installer-brand-substrate, namespace-isolation-contract, coexistence-regression-suite]
  affects: [bin/install.js, hooks/gsd-check-update.js]
tech_stack:
  added: [INSTALLER_BRAND_CONFIGS, resolveInstallerBrand, INSTALLER_BRAND, GSD_BRAND-env-driven]
  patterns: [brand-aware-seam, env-var-routing, namespace-isolation-contract]
key_files:
  created:
    - tests/installer-namespace-coexistence.test.cjs
    - tests/runtime-install-layout-isolation.test.cjs
  modified:
    - bin/install.js
    - hooks/gsd-check-update.js
decisions:
  - "INSTALLER_BRAND_CONFIGS as single source of truth for all brand-namespaced paths (official vs gsdcn)"
  - "GSD_BRAND env var as runtime brand selector — same pattern as 19-01 core.cjs seam"
  - "Agent file names (gsd-*.md) retain canonical gsd- prefix; only user-visible skill/command names use brand prefix"
  - "gsd-check-update.js reads GSD_BRAND at runtime to pick brand-namespaced cache dir"
  - "Hook registration (settings.json + Codex config.toml) injects GSD_BRAND prefix only for non-official brands"
metrics:
  duration: "28 minutes"
  completed: "2026-04-23"
  tasks_completed: 3
  files_changed: 4
---

# Phase 19 Plan 02: Installer Namespace Substrate Summary

GSD-CN installer/runtime namespace 已品牌参数化，官方 GSD 与 GSD-CN 在 manifest、patches、pristine、update-cache 及 skills/agents 安装目录命名空间全部隔离，51 个回归测试锁定共存 contract。

## What Was Built

### Task 1: installer 品牌参数化 (commit ed8dda9)

在 `bin/install.js` 顶部引入以下品牌感知基础设施：

- **`INSTALLER_BRAND_CONFIGS`**: `{ official: {...}, gsdcn: {...} }` — 两套品牌的所有命名空间参数
  - `official`: cmdPrefix=`gsd`, manifestName=`gsd-file-manifest.json`, patchesDirName=`gsd-local-patches`, pristineDirName=`gsd-pristine`, updateCacheDirName=`gsd`, updateCacheFileName=`gsd-update-check.json`
  - `gsdcn`: cmdPrefix=`gsdcn`, manifestName=`gsdcn-file-manifest.json`, patchesDirName=`gsdcn-local-patches`, pristineDirName=`gsdcn-pristine`, updateCacheDirName=`gsdcn`, updateCacheFileName=`gsdcn-update-check.json`
- **`resolveInstallerBrand()`**: 从 `GSD_BRAND` env var 读取，未知值 fallback 到 `official`
- **`INSTALLER_BRAND`**: 模块加载时固化的当前品牌配置
- **`MANIFEST_NAME`** 和 **`PATCHES_DIR_NAME`**: 从 `INSTALLER_BRAND` 派生（不再硬编码）
- 更新 `saveLocalPatches()` 中 pristine dir 路径从品牌参数读取
- 更新 update cache 路径 (`~/.cache/<brand>/...`) 从品牌参数读取
- 所有 `install()` 中的 `copyCommands*Skills` prefix 参数改为 `INSTALLER_BRAND.cmdPrefix`
- `reportLocalPatches()` 的 reapply 命令从品牌前缀派生
- 更新 `writeManifest()` 中 skill 扫描模式使用品牌前缀
- Hook 注册（settings.json / Codex config.toml）为非官方品牌注入 `GSD_BRAND=<brandId>` 前缀
- 新增 `tests/installer-namespace-coexistence.test.cjs` (24 passing)

### Task 2: update cache 与 gsd-check-update.js 品牌感知 (commit ed8dda9)

在 `hooks/gsd-check-update.js` 中：

- 读取 `GSD_BRAND` env var，选择对应 cache 目录名和 cache 文件名
- `official`（默认）: `~/.cache/gsd/gsd-update-check.json`
- `gsdcn`: `~/.cache/gsdcn/gsdcn-update-check.json`

### Task 2: uninstall 品牌感知隔离 (commit 50a01d5)

在 `uninstall()` 中：

- 引入 `uninstallCmdPrefix = INSTALLER_BRAND.cmdPrefix + '-'`
- 所有 skills 目录的 `startsWith('gsd-')` 改为 `startsWith(uninstallCmdPrefix)`
- 防止 GSD-CN 卸载时误删官方 GSD skills，或反之
- Agent 文件名（`gsd-*.md`）保留 canonical 前缀（内部名，非用户可见）

### Task 3: 共存回归测试锁定 contract (commit 50a01d5)

新增 `tests/runtime-install-layout-isolation.test.cjs`，27 个测试覆盖：

- 官方 manifest 名不含 gsdcn；GSD-CN manifest 含 gsdcn
- 两套 patches/pristine 目录名互不相同
- update cache dir/file 完全隔离（含全路径验证）
- 6 个命名空间字段的隔离矩阵（逐字段验证）
- 无 cross-contamination（gsdcn 值不出现在 official 集合中）
- 双安装模拟：disjoint set 验证

## Verification Results

```
node --test tests/installer-namespace-coexistence.test.cjs tests/runtime-install-layout-isolation.test.cjs
tests 51 | pass 51 | fail 0

node --check bin/install.js
# exit 0 (no syntax errors)
```

## Deviations from Plan

### Auto-additions (Rule 2)

**1. [Rule 2 - Correctness] uninstall() 品牌感知 skills 目录扫描**
- **Found during:** Task 2
- **Issue:** `uninstall()` 中 `startsWith('gsd-')` 扫描模式未进行品牌感知；GSD-CN 卸载时仍会扫描 `gsd-*` 目录，实际上 GSD-CN 安装的 skills 目录名使用 `gsdcn-` 前缀，导致卸载无法清理正确目录；同时也会误删官方 `gsd-*` 目录
- **Fix:** 引入 `uninstallCmdPrefix = INSTALLER_BRAND.cmdPrefix + '-'`，所有 skills 扫描改用品牌前缀
- **Files modified:** `bin/install.js`
- **Commit:** 包含在 50a01d5

## Known Stubs

None — 所有品牌命名空间参数均已完整实现并测试。

## Threat Flags

None — 无新增网络端点、认证路径或文件访问模式。新增的文件写入路径（`gsdcn-file-manifest.json`、`~/.cache/gsdcn/`）均完全隔离于官方路径，不形成新的信任边界。

## Self-Check: PASSED

- `bin/install.js` 已修改: FOUND
- `hooks/gsd-check-update.js` 已修改: FOUND
- `tests/installer-namespace-coexistence.test.cjs` 已创建: FOUND
- `tests/runtime-install-layout-isolation.test.cjs` 已创建: FOUND
- commit ed8dda9: FOUND
- commit 50a01d5: FOUND
- 51/51 tests pass: VERIFIED
- Syntax check bin/install.js: PASSED
