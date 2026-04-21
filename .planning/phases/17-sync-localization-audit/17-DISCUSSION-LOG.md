# Phase 17: Sync 后本地化文件审计与 blocker suite 重验证 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 17-sync-localization-audit
**Areas discussed:** 修复方向（install 输出契约）、INVENTORY 范围、审计记录格式、计划拆分粒度

---

## 修复方向 — install 输出契约

| Option | Description | Selected |
|--------|-------------|----------|
| 更新测试期望 | Phase 16 D-02 已决定：上游非保护文件全量接受。先确认上游新 installer 仍正确实现 pair-level fallback，再更新测试期望以匹配新行为。 | ✓ |
| 补丁 locale 集成以恢复旧行为 | 若上游重构成本内常就是预期的，局部补丁维护旧格式。 | |

**User's choice:** 更新测试期望（推荐）
**Notes:** 确认策略：先实际运行安装，验证 pair-level fallback 行为正确后再更新测试。

---

## 确认 installer 行为策略

| Option | Description | Selected |
|--------|-------------|----------|
| 运行安装来确认 | 实际调用安装 + 检查输出内容，确认 zh-CN / en fallback 行为符合预期后再更新测试期望。 | ✓ |
| 直接读 bin/install.js 内容确认 | 人工阅读代码逐行确认 locale 集成点，不必实际运行安装。速度更快但依赖人工阅读。 | |

**User's choice:** 运行来确认

---

## INVENTORY 范围

| Option | Description | Selected |
|--------|-------------|----------|
| 包含在 Phase 17 内 | sync 引入的额外失败，与其他 46 个失败一并封闭。最终目标 0 失败，包含此项才能实现。 | ✓ |
| 将 INVENTORY 更新延后 | INVENTORY 与 locale contract 无直接关系，LOC-01/LOC-02 只要求 blocker suite 0 失败。 | |

**User's choice:** 包含在 Phase 17 内（推荐）

---

## 审计记录格式

| Option | Description | Selected |
|--------|-------------|----------|
| 在 SUMMARY.md 中记录 | Phase 执行后天然产出 SUMMARY.md，审计结果嵌入其中。轻量、够用。 | ✓ |
| 独立的 AUDIT-REPORT.md | 与 VERIFICATION.md 并列，供后续里程碑直接参考审计历史。重量级审计场景才需要。 | |

**User's choice:** 在 SUMMARY.md 中记录（推荐）

---

## 计划拆分粒度

| Option | Description | Selected |
|--------|-------------|----------|
| 两个 plan | Plan 01（审计+修复）+ Plan 02（验收）。拆分清晰，审计/修复与验收各自独立，中间可设检查点。 | ✓ |
| 三个 plan | Plan 01（审计）+ Plan 02（修复）+ Plan 03（验收）。更细粒度，但审计和修复适合合并（审计即知道怎么修）。 | |
| 单一 plan | 全部工作在一个 plan 完成。简单直接，但中途无检查点。 | |

**User's choice:** 两个 plan（推荐）

---

## Claude's Discretion

- 审计脚本/git diff 命令的具体选择
- 测试期望的更新方式（逐文件 vs 批量）
- Plan 01 内子任务执行顺序

## Deferred Ideas

- 扩展 zh-CN 承诺面超出首批 6 个 Claude skills → v1.4+
- 其他 locale（ja-JP、ko-KR、pt-BR）质量补齐 → v1.4+
