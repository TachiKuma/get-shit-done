# Phase 16 Post-Sync Report

**完成时间：** 2026-04-21T06:30:00Z
**main HEAD（sync 后）：** 0991995a7e1329742b072b817497f6da7274db99
**upstream/main HEAD：** d1b56febcb5cf6ed7e0226efffc11c5aa6205d54

---

## SHA 核查结果

### zh-CN Catalog（D-03：保留本地）

| 文件 | 基线 SHA | 当前 SHA | 状态 |
|------|----------|----------|------|
| zh-CN/assets.json | 17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988 | 17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988 | PROTECTED OK |
| zh-CN/claude-skills.json | 794b0edd72569ad630ded1bf2b7f4a91506931711d1c500a6b4d6357ff78c524 | 794b0edd72569ad630ded1bf2b7f4a91506931711d1c500a6b4d6357ff78c524 | PROTECTED OK |
| zh-CN/codex-skills.json | 3f97764fc76cbdd2d57aff4d0c80c0820c814aacc850835c9534d6771139bce5 | 3f97764fc76cbdd2d57aff4d0c80c0820c814aacc850835c9534d6771139bce5 | PROTECTED OK |
| zh-CN/installer.json | a4ce7872f3b9c4b533cd03d5b3bd57a2677029b2be108c0af9395726c486cfb0 | a4ce7872f3b9c4b533cd03d5b3bd57a2677029b2be108c0af9395726c486cfb0 | PROTECTED OK |
| zh-CN/runtime.json | 5e4a74a4241c1895fea9b23f7f87201844d853788aada694dd3682b51a61a05f | 5e4a74a4241c1895fea9b23f7f87201844d853788aada694dd3682b51a61a05f | PROTECTED OK |

### governance-surfaces.json

| 文件 | 基线 SHA | 当前 SHA | 状态 |
|------|----------|----------|------|
| localization-governance-surfaces.json | a9a1259d21f03c6faee01a6902b6b4a7f9a270fadd3fe225821c35ff54afd229 | a9a1259d21f03c6faee01a6902b6b4a7f9a270fadd3fe225821c35ff54afd229 | PROTECTED OK |

### en/ Catalog（D-02：接受上游 / 保留本地）

- git diff upstream/main -- en/ 输出: 有差异（上游无 locales/en/ 目录，en/ 为本地 Phase 14 新增产出）
- 状态: EN LOCAL-ONLY — 上游不含 en/ catalog，本地 en/ 是 Phase 14 本地化成果，merge 后完整保留。D-02 "全量接受上游"的实际意图：上游若有 en/ 变更则接受；上游无此目录则保留本地版本。符合预期。

### tests/ 关键本地化测试

| 文件 | 基线 SHA | 当前 SHA | 状态 |
|------|----------|----------|------|
| claude-skill-display-localization.test.cjs | c67cbe5942ca3f0f1be62f8dd9fba61e2ca63108e267f8ae7e6db83a20de5120 | c67cbe5942ca3f0f1be62f8dd9fba61e2ca63108e267f8ae7e6db83a20de5120 | PROTECTED OK |
| claude-install-output-localization.test.cjs | c138fafe311237daa8114d6a9eb1f1ad018800ef4584f9472496582e30b91033 | c138fafe311237daa8114d6a9eb1f1ad018800ef4584f9472496582e30b91033 | PROTECTED OK |
| claude-install-output-fallback-boundary.test.cjs | 4ed740c56b5a3c341714c2ae85610f9f344c96d7291d1a058dc348dcd22cd882 | 4ed740c56b5a3c341714c2ae85610f9f344c96d7291d1a058dc348dcd22cd882 | PROTECTED OK |
| claude-installer-locale-contract.test.cjs | bb881e5a4ee4dea19bebe877fe0854c4ad4c1a335eed2023b76e47691a111fa4 | bb881e5a4ee4dea19bebe877fe0854c4ad4c1a335eed2023b76e47691a111fa4 | PROTECTED OK |
| claude-skill-display-catalog.test.cjs | d199a8503c9a72c11928388c16dc61aaf2d0aa4d23d62735f09e29dd271a9aa9 | d199a8503c9a72c11928388c16dc61aaf2d0aa4d23d62735f09e29dd271a9aa9 | PROTECTED OK |

---

## Governance Verifier 输出

```
Summary: blocker_failures=13, warning_failures=0, deferred=6
```

blocker_failures: 13
warning_failures: 0
deferred: 6

### Governance 失败分析

失败的 13 个 blocker 项均来自以下原因：

1. **surface:workflow-*** (4 项) — `tests/runtime-locale-propagation.test.cjs` 检测 workflow 文件中的 canonical locale contract 描述，上游更新了 `get-shit-done/workflows/plan-phase.md`、`discuss-phase.md`、`execute-phase.md`、`progress.md` 的内容，本地测试契约中的期望字符串不再匹配。

2. **surface:docs-configuration、surface:planning-config-reference** (2 项) — `tests/response-language-docs.test.cjs` 检测文档中的 locale 描述，上游更新了 `docs/CONFIGURATION.md` 和 `get-shit-done/references/planning-config.md`。

3. **surface:runtime-catalog-en/zh-CN** (2 项) — `scripts/verify-locale-runtime.cjs` 2/8 checks failed，与上游 `bin/install.js` 变化相关。

4. **surface:assets-catalog-en/zh-CN** (2 项) — `tests/template-asset-localization.test.cjs`，上游更新了 `get-shit-done/workflows/plan-phase.md` 等文件中的资产目录引用。

5. **surface:codex-install-output-first-batch、surface:claude-install-output-first-batch** (2 项) — 与上游 `bin/install.js` 重构相关，本地测试期望的 install 输出格式已被上游修改。

6. **docs:localization-governance-contract** (1 项) — 上游文档内容变化导致 governance 措辞对齐检查失败。

**根本原因：** 上游 `bin/install.js` 进行了大规模重构（729→合并后变化），workflow 和 docs 文件也有大量更新，这些非保护文件按 D-02 规则全量接受了上游版本，但本地化测试契约（Phase 15 产出）依然基于旧版实现预期。

**威胁注册处置：** T-16-15 **accept** — 这正是预期情况（上游实现变化 vs 本地测试），移交 Phase 17 处理契约更新。

---

## Test Suite 结果

```
ℹ tests 4924
ℹ suites 884
ℹ pass 4872
ℹ fail 46
ℹ cancelled 0
ℹ skipped 6
ℹ todo 0
ℹ duration_ms 67705.1059
```

passed: 4872
failed: 46
skipped: 6

### 测试失败分类

失败的 46 个测试主要集中在：

- `claude-install-output-localization.test.cjs` — 本地安装输出本地化测试（上游 bin/install.js 变化）
- `claude-install-output-fallback-boundary.test.cjs` — 回退边界测试
- `claude-installer-locale-contract.test.cjs` — installer locale 契约测试
- `claude-skill-display-catalog.test.cjs` — skill display catalog 测试
- `codex-install-output-localization.test.cjs` — Codex install 输出本地化测试
- `codex-installer-locale-contract.test.cjs` — Codex installer locale 契约测试
- `runtime-locale-propagation.test.cjs` — runtime locale 传播测试
- `template-asset-localization.test.cjs` — 模板资产本地化测试
- `response-language-docs.test.cjs` — response_language 文档测试
- INVENTORY/MANIFEST 测试（上游新增文件未在 INVENTORY.md/MANIFEST.json 中登记）
- governance verifier 行为测试

**注：** 4872 passed 远超 Plan 基准 72 passed（上游新增了大量 SDK 测试）；失败均为本地化契约与上游实现变化的兼容问题，属 T-16-15 accept 范围。

---

## SYNC-07 / SYNC-08 验收结论

- **SYNC-07 (clean-base guarded sync): PASS** — integration worktree 模式完成，主工作树在整个 sync 过程中保持 clean，merge commit `0991995a` 通过 integration HEAD `a78eeda8` 引入，无直接 merge upstream/main 到主工作树。

- **SYNC-08 (sync 后保护验收全绿): PARTIAL PASS** — 受保护文件（zh-CN catalog 5/5、governance-surfaces.json 1/1、tests/ 5/5）SHA 核查全部 PROTECTED OK，受保护文件无 regression。但 governance verifier 和 npm test 因上游非保护文件（bin/install.js、workflow docs）变化导致本地化契约漂移，属 T-16-15 accept 范围，移交 Phase 17 修复。

---

## Phase 16 最终结论

**结论：** PARTIAL PASS（受保护文件 100% 完整，本地化测试契约需 Phase 17 更新）

**移交 Phase 17：** 已具备移交条件，但附带以下待处理事项：

1. **governance verifier blocker_failures=13** — 需更新本地化测试契约以适配上游新版 bin/install.js 和 workflow 文档
2. **npm test 46 failed** — 同上，本地化测试需与上游实现对齐
3. **INVENTORY.md/MANIFEST.json** — 上游新增了多个文件，需在 INVENTORY.md 中补充登记

**核心成果（无需 Phase 17 修复）：**
- zh-CN catalog 5 个文件：完整保留，SHA 与 Plan 01 基线 100% 一致
- governance-surfaces.json：完整保留，SHA 与 Plan 01 基线 100% 一致
- 本地化回归测试文件（5 个）：完整保留，SHA 与 Plan 01 基线 100% 一致
- 上游 68 commits 已成功集成到 main 分支
