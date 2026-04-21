# GSD 多语言本地化框架

## What This Is

这是一个针对 `get-shit-done` 仓库的增量本地化重构项目，目标不是把仓库收敛成“单语简体中文版本”，而是建立一套可持续的多语言本地化框架。当前工作以用户直接接触的界面和产物为主线，覆盖运行时交互、文档、模板/报告和命令说明；固定文案进入 locale catalog，AI 生成型输出继续通过 `response_language` 控制输出语言。

## Current State

**Active: v1.3 — Phase 16 Complete (2026-04-21)**

Phase 16 已完成，上游 v1.37-v1.38（68 commits）已通过 clean-base integration worktree + WIP replay 安全合并到主工作树。本地化成果（zh-CN catalog、governance manifest、本地化测试文件）已 SHA 核查，11/11 PROTECTED OK。

**Current technical state:**
- 上游 v1.37-v1.38（68 commits）已集成，upstream/main HEAD `d1b56feb` 与本地 main 同步
- zh-CN catalog 5 个文件 SHA-256 与 Phase 16 基线完全一致，受保护文件无意外覆盖
- governance verifier 当前 `blocker_failures=13`（因上游 bin/install.js 重构与 workflow docs 更新导致契约漂移），移交 Phase 17 修复
- npm test 当前 `4872 passed, 46 failed`（远超 Phase 15 基线 72；失败项为本地化契约漂移，Phase 17 处理）
- Phase 17（LOC-01/LOC-02）为当前下一目标：审计 sync 后受影响的本地化覆盖文件并按需刷新，重验 blocker suite

## Current Milestone: v1.3 上游持续同步与本地化框架维护

**Goal:** 将上游 get-shit-done v1.37-v1.38 的变更完整合并到本地，保护 en + zh-CN 本地化成果，并建立"每次规划前强制上游预检"的可持续机制。

**Target features:**
- 上游 v1.37-v1.38 完整合并（clean-base sync + WIP replay，延续 Phase 14.1 策略）
- 本地化文件在 sync 后验收全绿（locale catalog、tests、governance）
- CLAUDE.md 上游预检强制规则落地（每次 discuss/plan 前必须执行）
- 刷新受本地化覆盖文件以匹配上游新格式/新 API

<details>
<summary>Archived Milestone Snapshot: v1.2 working state before close</summary>

- 里程碑目标：修复 v1.1 遗留的受控测试失败，并将 Claude skills 的 zh-CN display-layer 纳入正式本地化承诺面
- 中途插入 Phase 14.1：要求在继续 Claude zh-CN 落地前，先与 `upstream/main` 最新源码完全对齐

</details>

## Core Value

受支持语言的用户无需频繁回退英文，也能稳定完成 GSD 的阅读、配置、讨论、规划、执行与验证闭环；其中首批质量承诺限定为 `en + zh-CN`。

## Requirements

### Validated

- ✓ 仓库已具备多语言入口基础：根 README 与 `docs/` 已出现 `zh-CN`、`ja-JP`、`ko-KR`、`pt-BR` 镜像入口
- ✓ `response_language` 已存在于配置、初始化和部分 workflow 传播链路中，可作为生成型输出的现有语言控制基础
- ✓ 现有用户可见资产已经足够大，必须用正式治理机制承接，而不是继续做零散翻译补丁
- ✓ Phase 02 已建立英文 canonical docs index、locale mirror 覆盖矩阵、优先级和导航规则 - v1.0
- ✓ 根 README 与 `docs/README.md` / `docs/<locale>/README.md` 的高价值导航链路已对齐，首批 `en + zh-CN` 闭环可达 - v1.0
- ✓ Phase 03 已把关键 workflow 的 locale / `response_language` 传播链路、runtime fixed strings 与 fallback contract 固化为可回归验证的实现 - v1.0
- ✓ Phase 04 已为命令摘要、模板与报告建立 `catalog / generated / mirror / exempt` 分层策略，避免复制多套 locale-specific control flow - v1.0
- ✓ Phase 05 已建立 manifest-backed locale governance、glossary / playbook / drift policy，以及 blocker / warning / deferred 的统一验证入口 - v1.0
- ✓ `planning-config.md` 与 `config.cjs` 已通过 machine-readable truth-source 对齐，维护者文档不再依赖手工追补
- ✓ AUD-01: 项目已明确多语言本地化框架的工程边界、非目标和风险分层 - v1.0
- ✓ DOC-01: `docs/` 核心规范文档已建立英文 canonical source 与 locale mirror 的覆盖清单、优先级和同步规则 - v1.0
- ✓ DOC-02: 根 README、`docs/README.md` 与各 `docs/<locale>/README.md` 已形成清晰一致的语言导航链路 - v1.0
- ✓ RT-01: 关键 workflow 在目标 locale / `response_language` 约束下已保持语言一致性 - v1.0
- ✓ RT-02: 关键生成型文档、报告模板和用户可见规划产物已支持本地化输出 - v1.0
- ✓ CFG-01: 项目已提供清晰的 locale 配置入口，包括 `response_language` 的推荐值、兼容别名策略和使用说明 - v1.0
- ✓ AST-01: 用户直接阅读的命令说明、工作流说明、模板和报告资产已定义本地化策略 - v1.0
- ✓ QA-01: 已存在脚本化的 locale mirror 覆盖率检查 - v1.0
- ✓ QA-02: 已存在对 locale / `response_language` 传播链路的回归验证 - v1.0
- ✓ OPS-01: 已建立术语表、同步责任和 drift 治理规则 - v1.0
- ✓ v1.1 上游源码已通过受保护 integration worktree 合并到当前 `main`，且首批本地化 blocker suite 在合并前后均保持通过 - Phase 06
- ✓ v1.1 已完成 post-sync 用户可见表面重盘点，可基于同步后的 installer / command surfaces 继续后续本地化工作 - Phase 06
- ✓ INS-01 / INS-02 所需的 Codex installer locale-aware contract、English canonical `codex-skills` baseline 与 strict English fallback 已在 Phase 07 落地
- ✓ CDX-01 / CDX-02 所需的首批 6 个 Codex skills `zh-CN` display copy、English fallback 与真实安装验证已在 Phase 08 落地
- ✓ DOC-03: 正式文档现在明确区分运行时 `response_language` 与 Codex 安装产物 display-layer 本地化两条链路，并提供最小 Codex locale/fallback 示例 - Phase 09
- ✓ QA-03 / QA-04: Codex install output 的 `en + zh-CN` regression gate 与 governance blocker surfaces 已在 Phase 09 落地 - Phase 09
- ✓ FIX-01: Windows EPERM teardown 已修复（`cwd` 恢复 + `fs.rmSync` 重试），`bug-1736` / `bug-2248` 绿灯 - Phase 13
- ✓ FIX-02: aggregate hook guard regex 已同步到当前 installer warning 源码文本，`bug-1754` 绿灯 - Phase 13
- ✓ FIX-03: Kilo help text 已与上游 sync 后源码字面量对齐，`kilo-install` 绿灯 - Phase 13
- ✓ CLD-01 / CLD-02 / CLD-05: `claude-skills` English baseline、首批 6-skill `zh-CN` skeleton、pair-level fallback 与真实安装产物 contract 已在 Phase 14 落地 - v1.2
- ✓ SYNC-04 / SYNC-05 / SYNC-06: 受保护的 latest-upstream sync、WIP replay 与 Phase 15 refresh inputs 已在 Phase 14.1 落地 - v1.2
- ✓ CLD-03 / CLD-04 / QA-05: Claude first-batch zh-CN promised subset、governance blocker 与 install-output regression gate 已在 Phase 15 落地 - v1.2

### Active (v1.3)

- LOC-01: 审计 sync 后受影响的本地化覆盖文件并按需刷新，保持 en + zh-CN contract 一致
- LOC-02: sync 后 blocker suite 重验证（blocker_failures=0, warning_failures=0）

### Out of Scope

- 一次性把全部内部 agent prompt、推理文本和控制流 Markdown 做多语言镜像
  - 原因：这会显著扩大维护成本，并直接破坏“单套 workflow 控制流 + locale 资源”的设计边界
- 在本里程碑中承诺 `ja-JP`、`ko-KR`、`pt-BR` 与 `en + zh-CN` 同等完成度
  - 原因：当前用户反馈集中在 `zh-CN` 的 Codex 安装产物，先修复首批质量承诺面
- 把所有 skill-based runtime 的安装产物一起重做为 locale-aware
  - 原因：当前问题首先在 Codex 暴露，先收敛单一 runtime contract，避免过度设计
- 建立从英文命令文件自动派生所有 locale skill 正文的全自动流水线
  - 原因：当前优先级是先定义 display-layer contract 和 fallback，而不是扩大生成面
- 在未验证本地化成果完整性的情况下直接覆盖式同步上游
  - 原因：会让既有 locale contract、镜像文档和治理约束失去可信基线

## Context

- 当前仓库克隆自 `https://github.com/gsd-build/get-shit-done`，并已在 Phase 14.1 按受保护流程刷新到最新 upstream 代码面
- Codebase: Node.js CJS modules, locale JSON catalogs, markdown command/workflow assets, shell/cjs verification scripts
- Tech stack: `bin/install.js`（installer）+ `get-shit-done/locales/`（catalogs）+ `scripts/verify-localization-governance.cjs`（governance verifier）
- `.planning/config.json` 当前已启用 `response_language: "zh"`，初始化时规范化为 `zh-CN`
- Codex 与 Claude 两条 installer display-layer 本地化链路都坚持 English canonical body + localized frontmatter summary 的分层策略
- `get-shit-done/references/localization-governance-surfaces.json` 现已同时覆盖 Codex 与 Claude first-batch blocker surfaces
- `.planning/milestones/` 已完成 v1.0、v1.1、v1.2 的 roadmap / requirements / audit 归档

## Constraints

- **Upstream sync**: 必须优先选择低冲突的结构化改造，避免为每种语言复制一套完整 command/workflow source
- **Merge safety**: 上游同步必须先验证本地 locale catalogs、docs mirrors、governance manifest 和本地化测试基线，再决定合并策略
- **Language boundary**: 命令 ID、文件路径、代码标识符、运行时名称和关键技术术语保持英文，不做机械翻译
- **Canonical source**: 英文命令与 workflow 说明仍是 canonical source，locale-specific skill 文案只能作为 display layer 或 summary layer 承接
- **First-batch quality**: 当前质量承诺仍只覆盖 `en + zh-CN`
- **Installation UX**: 新方案必须同时适用于首次安装和重复安装，且不破坏现有 skill 清理 / 覆盖逻辑
- **Validation**: 不能只靠人工 spot-check 安装结果，必须有测试或 verifier 固化安装产物的 locale contract
- **Localization preservation**: 合并上游后，v1.0 已交付的本地化 contract 不能出现 silent regression

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 将项目目标升级为“多语言本地化框架” | 用户已明确否定“仅简体中文化”；现有仓库也已存在多语言资产 | ✓ Locked |
| 采用“locale catalogs + response_language”混合架构 | 固定文案和 AI 生成段落的治理方式不同，需要分层处理 | ✓ Locked |
| 首批质量承诺限定为 `en + zh-CN` | 先保证一个英文 canonical source 和一个高质量 locale 落地，降低实施风险 | ✓ Locked |
| 英文文档继续作为 canonical source | 可降低上游同步成本，并为 mirror 文档提供唯一事实源 | ✓ Locked |
| `.planning/` 跟随当前用户语言输出 | 规划产物属于用户直接消费内容，应该参与本地化体验，但不能翻译技术标识 | ✓ Locked |
| locale governance surface 由 JSON manifest 统一定义 blocker/warning/deferred | 避免测试和 verifier 维护两套分类策略，manifest 成为单一事实源 | ✓ v1.0 |
| hard gate 限定在首批 `en + zh-CN` 承诺面与 priority propagation chain | 不把所有 locale/docs/workflows 升级为 blocker，避免 warning-only 阻断 CI | ✓ v1.0 |
| planning-config.md 与 config.cjs 通过 machine-readable truth-source 对齐 | 静态键漂移通过测试自动检测，不依赖手工追补 | ✓ v1.0 |
| mixed-disposition shared verification_entry 定义为非法拓扑 | 保证 blocker-only exit semantics 不被 warning surface 意外升级 | ✓ v1.0 |
| v1.1 必须先安全合并上游，再继续新的本地化实现 | 避免在落后于上游的源码上继续累积改动，并减少后续集成成本 | ✓ Phase 06 |
| v1.1 先收敛 Codex 安装产物的 locale-aware contract，而不是同时扩展全部 runtime | 当前用户问题已在 Codex 明确复现；先解决单一 runtime，降低实现和验证复杂度 | ✓ Phase 07 |
| Codex installer display metadata 使用独立 `codex-skills` namespace，而不是从 command body 或 docs summary 反向提取 | 保持 English canonical command source 边界清晰，避免把 docs mirror 或 skill body 误当安装数据源 | ✓ Phase 07 |
| `description` 与 `metadata.short-description` 必须作为同一语言对一起 fallback 到 English canonical | 避免 locale 部分缺失时产生中英混合 frontmatter，确保安装产物观感可预测 | ✓ Phase 07 |
| 首批 6 个 Codex skills 的 `zh-CN` display copy 只覆盖 frontmatter 摘要层，真实验收必须包含 install-path tests 与 6 项本地安装 spot-check | 保持 display-layer 边界清晰，并用真实安装证据而不是仅靠 converter 单测关闭用户反馈 | ✓ Phase 08 |
| `GSD_TEST_MODE` 下 require `bin/install.js` 不产生 banner 噪音；Codex install/update 路径不对白名单外的说明性 `.claude` 文本误报 warning | 测试可读性与 warning actionability 是 installer seam 的质量门槛，两项均有回归测试锁定 | ✓ Phase 10 |
| Phase 11 debt disposition 采用"独立分类/处置矩阵主文档 + SUMMARY/VERIFICATION 摘要引用"交付方式；只修 deterministic、low blast radius 的本地问题 | 限制 Phase 11 的修复边界，避免为了清理 debt 引入新 regression，同时保持残余 debt 完整可追溯 | ✓ Phase 11 |
| Phase 12 证据刷新以 dated refresh section 扩充旧 baseline（而非替换），保持 Phase 11 原始证据追溯性 | 里程碑审计要求跨 phase 证据可追溯；新旧并存优于覆盖，审计者可直接判断漂移来源 | ✓ Phase 12 |
| Claude display-layer contract 延续 Codex 边界，只本地化 `description` / `short-description`，body 与技术标识保持英文 canonical | 避免把 command body / workflow 控制流错误扩展到 locale catalogs | ✓ v1.2 |
| Claude locale fallback 必须是 pair-level fallback，而不是字段级 fallback | 防止 `description` 与 `metadata.short-description` 混语，保持安装产物观感与测试行为可预测 | ✓ v1.2 |
| latest-upstream sync 采用 clean-base integration worktree + replay 本地多语言 WIP 的两阶段模式 | 当前主工作树长期脏，直接 merge 风险不可接受；需要把 clean sync 与 replay 完成态明确拆开 | ✓ v1.2 |
| Claude first-batch zh-CN promised subset 与 wider inventory English baseline 必须分层：前者 blocker，后者 boundary regression | 避免 82-skill baseline 被误升级为 hard gate，同时仍保护 sync 后新增 remainder 的 English fallback | ✓ v1.2 |
| Phase 16 guarded sync T-16-15 accept 策略：upstream bin/install.js 重构导致的本地化契约漂移不在 Phase 16 内修复，移交 Phase 17（LOC-01/LOC-02） | Phase 16 专注 sync 操作本身与受保护文件完整性，Phase 17 负责契约刷新与 blocker suite 重验证 | ✓ Phase 16 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-21 — Phase 16 complete (SYNC-07 PASS, SYNC-08 PARTIAL PASS, Phase 17 next)*
