---
phase: "20"
plan: "01"
subsystem: install-brand-activation
tags: [gsdcn, installer, brand-activation, readme, coexistence]
dependency_graph:
  requires: []
  provides: [explicit-gsdcn-install-entry, brand-activation-seam]
  affects: [bin/install.js, README.md]
requirements_completed: [CN-03, CN-04, CN-05, CN-07]
gaps_closed: [GAP-19-INSTALL-BRAND-ACTIVATION]
metrics:
  completed: "2026-04-24"
  tests: "node --check bin/install.js; Phase 20 focused suite later passes 64/64"
---

# Phase 20 Plan 01: Install Brand Activation Summary

GSD-CN 安装入口已从隐式环境变量依赖改为显式用户入口：`npx get-shit-done-cc@latest --gsdcn`。installer 现在支持 `--gsdcn` 与 `--brand gsdcn`，并保持无参数默认 official 行为不变。

## What Changed

- `bin/install.js`
  - `resolveInstallerBrand(argv, env)` 现在按 CLI args / env 解析 brand。
  - `--gsdcn` 激活 `INSTALLER_BRAND_CONFIGS.gsdcn`。
  - `--brand gsdcn` 作为等价显式入口。
  - Cline `.clinerules` 生成使用 `INSTALLER_BRAND.cmdPrefix` 与 brand-aware planning root。
  - 安装完成提示使用当前 brand 的命令前缀。
- `README.md`
  - 快速开始改为 `npx get-shit-done-cc@latest --gsdcn`。
  - 补充 PowerShell 等价命令。
  - 明确 official 默认安装与 GSD-CN `--gsdcn` 安装互不覆盖。

## Compatibility

- 无参数 `npx get-shit-done-cc@latest` 仍解析为 official。
- 未识别 brand 仍 fallback official。
- 现有 `GSD_BRAND=gsdcn` 测试/自动化路径仍保留。

## Handoff

`GAP-19-INSTALL-BRAND-ACTIVATION` 的实现闭环已完成；20-02 负责用 E2E/fixture 回归测试锁定该行为。
