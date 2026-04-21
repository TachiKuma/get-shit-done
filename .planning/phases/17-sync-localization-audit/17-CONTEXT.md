# Phase 17: Sync 后本地化文件审计与 blocker suite 重验证 - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

审计 Phase 16 upstream sync（上游 v1.37-v1.38，68 commits）引入的变更对现有本地化覆盖文件的影响，按需刷新 locale catalog 及测试契约，并通过完整 blocker suite 验收（`blocker_failures=0, warning_failures=0`）。

**包含在本阶段：**
- 键漂移审计（en/ 与 zh-CN/ catalog 的 key 集合对比，记录新增/删除 key）
- 确认上游新 bin/install.js 仍正确实现 pair-level fallback contract（运行安装验证）
- 更新测试期望以匹配上游新实现（不回退上游变更）
- 刷新 locale catalog 中因上游变更而需要更新的键
- 更新 INVENTORY.md / INVENTORY-MANIFEST.json 以登记上游新增文件
- 重新运行 governance verifier 和首批 6-skill suite，确认 0 失败

**不包含在本阶段：**
- 扩展 zh-CN 承诺面超出首批 6 个 Claude skills
- 新增 locale surface（非 sync 后 drift 修复）
- 修改 upstream 保护文件（locales/zh-CN/、tests/ 中的受保护测试文件、governance-surfaces.json）

</domain>

<decisions>
## Implementation Decisions

### 修复策略

- **D-01:** 测试期望更新方向为「跟上游走」——Phase 16 D-02 已决定非保护文件全量接受上游版本。安装输出格式是上游 bin/install.js 重构的正当结果，测试应更新以匹配新实现。

- **D-02:** 更新测试期望前，必须先通过实际安装运行确认上游新 installer 仍正确支持 pair-level fallback（zh-CN/en 各自独立、任意字段缺失则整对回退 en）。确认通过后，再统一更新相关测试的预期输出。若确认发现 pair-level fallback 已损坏，则改为补丁修复（但这是异常情况，预期不会发生）。

### INVENTORY 范围

- **D-03:** INVENTORY.md 和 INVENTORY-MANIFEST.json 的更新包含在 Phase 17 范围内。上游新增文件导致的登记失败（`every CLI module has a row in INVENTORY.md` 等测试）与本次 sync audit 一并封闭，不延后。最终目标是 npm test 全部通过（包含 INVENTORY 相关测试）。

### 审计记录格式

- **D-04:** 键漂移审计结果（新增/删除的 key、surface 增减、workflow 格式变化的有无）记录在各 Plan 的 SUMMARY.md 中，无需独立的 AUDIT-REPORT.md 文件。"无变化"也是有效结论，需要明确写入 SUMMARY.md。

### 计划拆分粒度

- **D-05:** Phase 17 拆分为两个 plan：
  - **Plan 01（审计 + 修复）：** 键漂移审计 → 确认 installer pair-level fallback 行为 → 更新 locale catalog 键（如有漂移）→ 更新失败测试期望 → 更新 INVENTORY.md/MANIFEST.json 登记
  - **Plan 02（验收）：** 运行完整 `node scripts/verify-localization-governance.cjs`（目标 `blocker_failures=0, warning_failures=0`）+ 运行首批 6-skill zh-CN + English fallback boundary regression suite（目标 0 失败）+ 运行完整 npm test（记录总通过率）

### Claude's Discretion

- 具体的审计脚本或 git diff 命令的选择（由执行阶段决定）
- 测试期望的具体更新方式（逐文件 vs 批量更新，由执行阶段决定最合适的策略）
- Plan 01 内各子任务的执行顺序（基于依赖关系由规划阶段决定）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 需求规格

- `.planning/REQUIREMENTS.md` §v1.3 Requirements — LOC-01（键漂移审计与刷新）、LOC-02（blocker suite 重验证）的验收标准
- `.planning/ROADMAP.md` §Phase 17 — Success Criteria（4 条），特别是 SC-1（审计有记录）、SC-2（catalog 刷新符合 pair-level fallback contract）、SC-3（blocker_failures=0, warning_failures=0）、SC-4（首批 6-skill suite 0 失败）

### Phase 16 移交上下文

- `.planning/phases/16-upstream-sync-protected/16-POST-SYNC-REPORT.md` — 13 个 governance blocker 的详细分析 + 46 个测试失败的分类（blocker 类型、根本原因：bin/install.js 重构 + workflow/docs 更新）
- `.planning/phases/16-upstream-sync-protected/16-VERIFICATION.md` — Phase 16 SC-5 deferred 条目（blocker_failures=13 → Phase 17 负责修复）

### 本地化 contract 基础

- `CLAUDE.md` §本地化框架核心原则 — pair-level fallback 规则（任一字段缺失则整对回退 English canonical，禁止 mixed-language frontmatter）
- `get-shit-done/references/localization-governance-surfaces.json` — governance manifest（受保护文件，Phase 17 不得修改结构，只按需刷新 content 匹配上游新格式）
- `.planning/phases/16-upstream-sync-protected/16-WIP-SNAPSHOT.md` — zh-CN 5 个文件 + governance-surfaces.json 的 SHA-256 基线（Phase 17 操作后 zh-CN 文件应与此基线一致，或有明确的键漂移刷新记录）

### 验收脚本

- `scripts/verify-localization-governance.cjs` — 执行 `node scripts/verify-localization-governance.cjs`，要求输出 `blocker_failures=0, warning_failures=0`
- `scripts/verify-locale-runtime.cjs` — runtime catalog 检查脚本（2/8 checks failed 是当前状态）

### 失败测试的测试文件（Plan 01 的修复对象）

- `tests/runtime-locale-propagation.test.cjs` — 检查 workflow 文件（discuss-phase.md、plan-phase.md 等）的 locale 传播模式
- `tests/template-asset-localization.test.cjs` — 检查 plan-phase.md 等文件的资产目录引用
- `tests/response-language-docs.test.cjs` — 检查 docs/CONFIGURATION.md 的 locale 描述
- `tests/claude-install-output-localization.test.cjs` — Claude install 输出本地化测试
- `tests/claude-install-output-fallback-boundary.test.cjs` — Claude fallback boundary 测试
- `tests/claude-installer-locale-contract.test.cjs` — Claude installer locale 契约测试
- `tests/claude-skill-display-catalog.test.cjs` — Claude skill display catalog 测试
- `tests/codex-install-output-localization.test.cjs` — Codex install 输出本地化测试
- `tests/codex-installer-locale-contract.test.cjs` — Codex installer locale 契约测试

</canonical_refs>

<code_context>
## Existing Code Insights

### 当前故障全景（Phase 16 移交）

- **governance blocker_failures=13** — 分布于 surface:workflow-* (4)、surface:docs-* (2)、surface:runtime-catalog-en/zh-CN (2)、surface:assets-catalog-en/zh-CN (2)、surface:codex/claude-install-output-first-batch (2)、docs:localization-governance-contract (1)
- **npm test 46 failed** — 主要集中在 install 输出测试、locale 契约测试、INVENTORY/MANIFEST 测试、runtime locale 传播测试、template asset 测试、response_language docs 测试
- **4872 passed** — 远超 Phase 15 基线 72（上游新增了大量 SDK 测试）

### 受保护文件（Phase 17 不得意外修改）

- `get-shit-done/locales/zh-CN/*.json`（5 个文件）— SHA-256 基线已在 16-WIP-SNAPSHOT.md 固化，如需键漂移刷新则必须有明确依据
- `get-shit-done/references/localization-governance-surfaces.json` — governance manifest，SHA 基线固化
- `tests/` 中的受保护测试文件（5 个，SHA 基线固化）— 注意：其他 tests/ 文件（如 runtime-locale-propagation.test.cjs）不在受保护名单，可修改

### 验收基础设施

- `scripts/verify-localization-governance.cjs` — governance verifier，当前输出 blocker_failures=13
- npm test — 当前 4872 passed / 46 failed

### 集成点

- `bin/install.js` — 上游大规模重构，是 install 输出测试失败的根本原因；Phase 17 需确认其 locale 集成仍正确
- `get-shit-done/locales/en/` 与 `get-shit-done/locales/zh-CN/` — locale catalog，可能需要键刷新

</code_context>

<specifics>
## Specific Ideas

- 审计"无变化"也是有效结论，SUMMARY.md 中需要明确写入（例如："zh-CN catalog 键集与 Phase 15 完全一致，无漂移"）
- 确认 installer 行为时，应同时检查 zh-CN 和 en 两个路径的安装输出，覆盖 pair-level fallback 的完整边界
- INVENTORY.md 更新后，需要同步更新 INVENTORY-MANIFEST.json（两者需一致）

</specifics>

<deferred>
## Deferred Ideas

- 扩展 zh-CN 承诺面超出首批 6 个 Claude skills → v1.4+
- 其他 locale（ja-JP、ko-KR、pt-BR）的同等质量补齐 → v1.4+
- 对全部内部 agent prompt 做多语言镜像 → Out of Scope（已列为项目级 Out of Scope）

</deferred>

---

*Phase: 17-sync-localization-audit*
*Context gathered: 2026-04-21*
