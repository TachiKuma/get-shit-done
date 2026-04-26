# GSD 用户指南

工作流、故障排除和配置的详细参考。快速入门设置请参阅 [README](README.md)。

---

## 目录

- [端到端操作演示](#端到端操作演示)
- [工作流图解](#工作流图解)
- [命令参考](#命令参考)
- [配置参考](#配置参考)
- [使用示例](#使用示例)
- [故障排除](#故障排除)
- [恢复快速参考](#恢复快速参考)

---

## 端到端操作演示

本演示展示了一个典型单阶段项目中 GSD 各阶段的完整串联——一个用于验证 webhook 签名的小型 Node.js REST API。跟随本演示，你将理解每个命令的作用、它创建了什么文件，以及下一个命令如何使用这些文件。

### 1. 创建项目

```
/gsd-new-project
```

GSD 会询问你的想法，启动并行研究 Agent，提取需求，并创建路线图。在写任何代码之前，你需要先批准路线图。

**输出示例（节选）：**

```
> 你在构建什么？
  一个用于 Express 应用的 webhook 签名验证中间件。

> 目标用户是谁？
  集成第三方 webhook（Stripe、GitHub、Shopify）的后端开发者。

[研究 Agent 并行运行中...]
[需求提取中...]

路线图（1 个阶段）：
  阶段 1 — 核心中间件：HMAC-SHA256 签名验证、
             时间安全比较、可配置的容差窗口。

批准？[y/n]
```

**创建的文件：**

```
.planning/
  PROJECT.md          # "Webhook 验证中间件 — Express, HMAC-SHA256..."
  REQUIREMENTS.md     # REQ-001: 验证签名头; REQ-002: 时间安全...
  ROADMAP.md          # 阶段 1 状态: pending
  STATE.md            # 会话记忆，当前进度
```

`ROADMAP.md` 节选：
```markdown
## Phase 1 — Core middleware
**Status:** pending
**Goal:** HMAC-SHA256 signature validation with timing-safe compare and a
configurable replay-protection tolerance window.
**Requirements:** REQ-001, REQ-002, REQ-003
```

### 2. 讨论并规划阶段

```
/gsd-discuss-phase 1
```

GSD 读取阶段目标，并在开始规划前询问你的实现偏好。这是你塑造"如何构建"而不仅是"构建什么"的关键环节。

```
> 无效签名应如何处理？
  立即拒绝并返回 401，记录原始 header 以便调试。

> 容差窗口应支持按路由配置还是全局配置？
  全局配置，但允许通过中间件选项进行逐路由覆盖。

> HMAC 有什么库偏好？
  仅用 Node 内置 crypto——不引入额外依赖。
```

**创建的文件：** `.planning/phases/01-core-middleware/CONTEXT.md`

`CONTEXT.md` 节选：
```markdown
## Implementation Decisions
- Invalid signatures → 401, log raw header
- Tolerance window → global default, per-route override via options object
- HMAC library → Node built-in crypto (no external deps)
- Error format → { error: "invalid_signature", ts: <epoch> }
```

现在规划阶段：

```
/gsd-plan-phase 1
```

GSD 启动四个并行研究 Agent（技术栈、功能、架构、陷阱），然后 Planner 读取 `CONTEXT.md` 和研究结果，创建原子任务计划。Plan-checker 验证每个计划能达成阶段目标后才保存。

**创建的文件：**

```
.planning/phases/01-core-middleware/
  RESEARCH.md         # 发现：crypto.timingSafeEqual 文档，重放攻击模式...
  01-01-PLAN.md       # 任务：创建 validateSignature() 核心函数
  01-02-PLAN.md       # 任务：Express 中间件封装 + 错误处理
```

`01-01-PLAN.md` 节选：
```xml
<task type="auto">
  <name>Create validateSignature core function</name>
  <files>src/validate.js, src/validate.test.js</files>
  <action>
    Use crypto.createHmac('sha256', secret).update(rawBody).digest('hex').
    Compare with crypto.timingSafeEqual() — never === or ==.
    Accept tolerance window in ms; reject if |timestamp - now| exceeds it.
  </action>
  <verify>npm test -- --grep "validateSignature"</verify>
  <done>All timing-safe comparison tests pass; replay outside window returns false</done>
</task>
```

### 3. 执行

```
/gsd-execute-phase 1
```

GSD 将计划按波次分组（独立计划并行，依赖计划串行），为每个计划启动独立的 200k 上下文 Executor，并原子提交每个任务。

```
Wave 1（并行）：
  [Executor A] → 01-01-PLAN.md（核心函数）  ✓ 已提交
  [Executor B] → 01-02-PLAN.md（中间件）      ✓ 已提交

[Verifier] 根据阶段目标检查代码库...
  REQ-001 validateSignature() ✓
  REQ-002 时间安全比较 ✓
  REQ-003 容差窗口    ✓
  状态: PASS
```

**执行后 Git 历史：**

```
a1b2c3d feat(01-01): implement validateSignature with timingSafeEqual
d4e5f6g feat(01-02): add Express middleware wrapper and 401 error format
h7i8j9k chore(01): phase 1 verification — all requirements met
```

**创建的文件：**

```
.planning/phases/01-core-middleware/
  01-01-SUMMARY.md    # "实现了 validateSignature()，47 行，测试通过"
  01-02-SUMMARY.md    # "中间件封装了验证器，401 时记录原始 header"
  VERIFICATION.md     # REQ-001 ✓, REQ-002 ✓, REQ-003 ✓ — PASS
```

`STATE.md` 自动更新以反映新的阶段状态：

```markdown
## Current Position
Phase 1 — Core middleware: executed, pending verify
```

### 4. 验证

```
/gsd-verify-work 1
```

GSD 从阶段目标中提取可测试的交付物，并逐一引导你验证。

```
[1/3] 你能 require 中间件并将其挂载到 Express 路由吗？
> yes

[2/3] 携带有效签名的请求是否返回 200？
> yes

[3/3] 携带无效签名的请求是否返回 401 并包含 { error: "invalid_signature" }？
> no——我得到的是 500

[诊断中...]
根本原因：当缓冲区长度不同时，中间件捕获了 crypto.timingSafeEqual TypeError。
修复方案：比较前将缓冲区规范化为相同长度。

修复计划已创建：.planning/phases/01-core-middleware/01-03-PLAN.md
运行 /gsd-execute-phase 1 来应用修复。
```

重新执行并重新验证后：

```
3 项检查全部通过。阶段 1 已验证。
```

**创建的文件：** `.planning/phases/01-core-middleware/UAT.md`

### 下一步

阶段验证完成后，发布它：

```
/gsd-ship 1          # 创建带自动生成说明的 PR
```

对于多阶段项目，重复以下循环：

```
/gsd-discuss-phase 2
/gsd-plan-phase 2
/gsd-execute-phase 2
/gsd-verify-work 2
```

或者让 GSD 自动决定下一步：

```
/gsd-next
```

所有阶段完成后：

```
/gsd-audit-milestone     # 验证所有需求已交付
/gsd-complete-milestone  # 归档，打 release tag
```

**本演示涉及的相关标志：**

| 标志 | 命令 | 使用时机 |
| ---- | ------- | -------- |
| `--auto` | `/gsd-new-project` | 跳过交互式提问，从 PRD 文件摄取 |
| `--research` | `/gsd-quick` | 为临时任务添加研究 Agent |
| `--validate` | `/gsd-quick` | 添加计划检查和执行后验证 |
| `--chain` | `/gsd-discuss-phase` | 自动串联 discuss → plan → execute，无需手动停止 |
| `--skip-research` | `/gsd-plan-phase` | 领域已熟悉时跳过研究 Agent |
| `--draft` | `/gsd-ship` | 创建草稿 PR 而非就绪待审 PR |

完整命令参考（含所有标志），请参阅 [`docs/COMMANDS.md`](../COMMANDS.md)。配置选项（模型配置文件、工作流 Agent、Git 分支管理），请参阅 [`docs/CONFIGURATION.md`](../CONFIGURATION.md)。

---

## 工作流图解

### 完整项目生命周期

```
  ┌──────────────────────────────────────────────────┐
  │                   新建项目                        │
  │  /gsd-new-project                                │
  │  提问 -> 研究 -> 需求 -> 路线图                    │
  └─────────────────────────┬────────────────────────┘
                            │
             ┌──────────────▼─────────────┐
             │      每个阶段:              │
             │                            │
             │  ┌────────────────────┐    │
             │  │ /gsd-discuss-phase │    │  <- 锁定偏好
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd-plan-phase    │    │  <- 研究 + 规划 + 验证
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd-execute-phase │    │  <- 并行执行
             │  └──────────┬─────────┘    │
             │             │              │
             │  ┌──────────▼─────────┐    │
             │  │ /gsd-verify-work   │    │  <- 手动 UAT
             │  └──────────┬─────────┘    │
             │             │              │
             │     下一阶段?────────────┘
             │             │ 否
             └─────────────┼──────────────┘
                            │
            ┌───────────────▼──────────────┐
            │  /gsd-audit-milestone        │
            │  /gsd-complete-milestone     │
            └───────────────┬──────────────┘
                            │
                   另一个里程碑?
                       │          │
                      是         否 -> 完成!
                       │
               ┌───────▼──────────────┐
               │  /gsd-new-milestone  │
               └──────────────────────┘
```

### 规划代理协调

```
  /gsd-plan-phase N
         │
         ├── 阶段研究员 (x4 并行)
         │     ├── 技术栈研究员
         │     ├── 功能研究员
         │     ├── 架构研究员
         │     └── 陷阱研究员
         │           │
         │     ┌──────▼──────┐
         │     │ RESEARCH.md │
         │     └──────┬──────┘
         │            │
         │     ┌──────▼──────┐
         │     │   规划者    │  <- 读取 PROJECT.md, REQUIREMENTS.md,
         │     │             │     CONTEXT.md, RESEARCH.md
         │     └──────┬──────┘
         │            │
         │     ┌──────▼───────────┐     ┌────────┐
         │     │   计划检查器     │────>│ 通过?  │
         │     └──────────────────┘     └───┬────┘
         │                                  │
         │                             是   │  否
         │                              │   │   │
         │                              │   └───┘  (循环，最多 3 次)
         │                              │
         │                        ┌─────▼──────┐
         │                        │ PLAN 文件  │
         │                        └────────────┘
         └── 完成
```

### 验证架构 (Nyquist 层)

在 plan-phase 研究期间，GSD 现在在任何代码编写之前将自动化测试覆盖率映射到每个阶段需求。这确保当 Claude 的执行者提交任务时，反馈机制已经存在可以在几秒钟内验证它。

研究员检测你现有的测试基础设施，将每个需求映射到特定的测试命令，并识别在实现开始之前必须创建的任何测试脚手架（波次 0 任务）。

计划检查器将其强制作为第 8 个验证维度：缺少自动化验证命令的计划将不会被批准。

**输出：** `{阶段}-VALIDATION.md` —— 阶段的反馈契约。

**禁用：** 在 `/gsd-settings` 中设置 `workflow.nyquist_validation: false`，用于测试基础设施不是重点的快速原型阶段。

### 追溯验证 (`/gsd-validate-phase`)

对于在 Nyquist 验证存在之前执行的阶段，或只有传统测试套件的现有代码库，追溯审计并填补覆盖缺口：

```
  /gsd-validate-phase N
         |
         +-- 检测状态 (VALIDATION.md 存在? SUMMARY.md 存在?)
         |
         +-- 发现: 扫描实现，将需求映射到测试
         |
         +-- 分析缺口: 哪些需求缺少自动化验证?
         |
         +-- 呈现缺口计划供审批
         |
         +-- 生成审计器: 生成测试，运行，调试（最多 3 次尝试）
         |
         +-- 更新 VALIDATION.md
               |
               +-- COMPLIANT -> 所有需求都有自动化检查
               +-- PARTIAL -> 部分缺口升级为仅手动
```

审计器从不修改实现代码 —— 只修改测试文件和 VALIDATION.md。如果测试发现实现 bug，它会标记为升级让你处理。

**何时使用：** 在启用了 Nyquist 之前规划的阶段执行后，或在 `/gsd-audit-milestone` 发现 Nyquist 合规缺口后。

### 执行波次协调

```
  /gsd-execute-phase N
         │
         ├── 分析计划依赖
         │
         ├── 波次 1 (独立计划):
         │     ├── 执行者 A (全新 200K 上下文) -> 提交
         │     └── 执行者 B (全新 200K 上下文) -> 提交
         │
         ├── 波次 2 (依赖波次 1):
         │     └── 执行者 C (全新 200K 上下文) -> 提交
         │
         └── 验证器
               └── 根据阶段目标检查代码库
                     │
                     ├── 通过 -> VERIFICATION.md (成功)
                     └── 失败 -> 问题记录到 /gsd-verify-work
```

### 现有代码库工作流

```
  /gsd-map-codebase
         │
         ├── 技术栈映射器     -> codebase/STACK.md
         ├── 架构映射器      -> codebase/ARCHITECTURE.md
         ├── 约定映射器 -> codebase/CONVENTIONS.md
         └── 关注点映射器   -> codebase/CONCERNS.md
                │
        ┌───────▼──────────┐
        │ /gsd-new-project │  <- 问题聚焦于你正在添加的内容
        └──────────────────┘
```

---

## 命令参考

### 核心工作流

| 命令 | 用途 | 何时使用 |
|---------|---------|-------------|
| `/gsd-new-project` | 完整项目初始化：提问、研究、需求、路线图 | 新项目开始时 |
| `/gsd-new-project --auto @idea.md` | 从文档自动初始化 | 有现成的 PRD 或想法文档 |
| `/gsd-discuss-phase [N] [--chain] [--power]` | 捕获实现决策（`--chain` 自动链式，`--power` 文件批量输入） | 规划前，塑造构建方式 |
| `/gsd-plan-phase [N]` | 研究 + 规划 + 验证 | 执行阶段前 |
| `/gsd-execute-phase <N>` | 在并行波次中执行所有计划 | 规划完成后 |
| `/gsd-verify-work [N]` | 带自动诊断的手动 UAT | 执行完成后 |
| `/gsd-audit-milestone` | 验证里程碑达到其完成定义 | 完成里程碑前 |
| `/gsd-complete-milestone` | 归档里程碑，标记发布 | 所有阶段已验证 |
| `/gsd-new-milestone [name]` | 开始下一个版本周期 | 完成里程碑后 |

### 导航

| 命令 | 用途 | 何时使用 |
|---------|---------|-------------|
| `/gsd-progress` | 显示状态和下一步 | 任何时候 -- "我在哪?" |
| `/gsd-resume-work` | 从上次会话恢复完整上下文 | 开始新会话 |
| `/gsd-pause-work` | 保存上下文交接 | 阶段中途停止 |
| `/gsd-help` | 显示所有命令 | 快速参考 |
| `/gsd-update` | 更新 GSD 并预览变更日志 | 检查新版本 |
| `/gsd-join-discord` | 打开 Discord 社区邀请 | 问题或社区 |

### 阶段管理

| 命令 | 用途 | 何时使用 |
|---------|---------|-------------|
| `/gsd-add-phase` | 向路线图追加新阶段 | 初始规划后范围增长 |
| `/gsd-insert-phase [N]` | 插入紧急工作（小数编号） | 里程碑中途紧急修复 |
| `/gsd-remove-phase [N]` | 删除未来阶段并重新编号 | 移除某个功能 |
| `/gsd-list-phase-assumptions [N]` | 预览 Claude 的预期方法 | 规划前，验证方向 |
| `/gsd-plan-milestone-gaps` | 为审计缺口创建阶段 | 审计发现缺失项后 |
| `/gsd-research-phase [N]` | 仅深度生态研究 | 复杂或不熟悉的领域 |
| `/gsd-autonomous [--from N] [--to N] [--only N]` | 自主执行剩余阶段（`--to N` 到阶段 N 停止） | 批量自动处理 |
| `/gsd-analyze-dependencies` | 检测阶段间依赖关系 | `/gsd-manager` 前分析 |

### 状态管理

| 命令 | 用途 | 何时使用 |
|---------|---------|-------------|
| `state validate` | 检测 STATE.md 与文件系统之间的偏差 | STATE.md 看起来不对时 |
| `state sync` | 从磁盘上的实际项目状态重建 STATE.md | 验证发现偏差后 |
| `state sync --verify` | 干运行：显示提议的更改但不写入 | sync 前预览 |
| `state planned-phase --phase N --plans N` | 记录 plan-phase 完成后的状态转换 | plan-phase 后 |

### 现有代码库和工具

| 命令 | 用途 | 何时使用 |
|---------|---------|-------------|
| `/gsd-map-codebase` | 分析现有代码库 | 在现有代码上运行 `/gsd-new-project` 之前 |
| `/gsd-quick` | 带 GSD 保证的临时任务 | Bug 修复、小功能、配置更改 |
| `/gsd-debug [desc] [--diagnose]` | 带持久状态的系统化调试（`--diagnose` 仅诊断） | 出问题时 |
| `/gsd-add-todo [desc]` | 捕获想法留待后用 | 会话期间想到什么 |
| `/gsd-check-todos` | 列出待处理事项 | 查看捕获的想法 |
| `/gsd-settings` | 配置工作流开关和模型配置 | 更改模型、切换代理 |
| `/gsd-set-profile <profile>` | 快速切换配置 | 更改成本/质量权衡 |
| `/gsd-reapply-patches` | 更新后恢复本地修改 | 如果你有本地编辑，在 `/gsd-update` 后 |

---

## 配置参考

GSD 在 `.planning/config.json` 中存储项目设置。在 `/gsd-new-project` 期间配置或稍后用 `/gsd-settings` 更新。

### 完整 config.json 模式

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true
  },
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "gsd/phase-{phase}-{slug}",
    "milestone_branch_template": "gsd/{milestone}-{slug}"
  }
}
```

### 核心设置

| 设置 | 选项 | 默认值 | 控制内容 |
|---------|---------|---------|------------------|
| `mode` | `interactive`, `yolo` | `interactive` | `yolo` 自动批准决策；`interactive` 每步确认 |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | 阶段粒度：范围切分多细（3-5、5-8 或 8-12 个阶段） |
| `model_profile` | `quality`, `balanced`, `budget` | `balanced` | 每个代理的模型层级（见下表） |

### 规划设置

| 设置 | 选项 | 默认值 | 控制内容 |
|---------|---------|---------|------------------|
| `planning.commit_docs` | `true`, `false` | `true` | `.planning/` 文件是否提交到 git |
| `planning.search_gitignored` | `true`, `false` | `false` | 在广泛搜索中添加 `--no-ignore` 以包含 `.planning/` |

> **注意：** 如果 `.planning/` 在 `.gitignore` 中，无论配置值如何，`commit_docs` 自动为 `false`。

### 工作流开关

| 设置 | 选项 | 默认值 | 控制内容 |
|---------|---------|---------|------------------|
| `workflow.research` | `true`, `false` | `true` | 规划前的领域调查 |
| `workflow.plan_check` | `true`, `false` | `true` | 计划验证循环（最多 3 次迭代） |
| `workflow.verifier` | `true`, `false` | `true` | 根据阶段目标的执行后验证 |
| `workflow.nyquist_validation` | `true`, `false` | `true` | plan-phase 期间的验证架构研究；第 8 个计划检查维度 |

在熟悉的领域或需要节省 token 时禁用这些以加速阶段。

### Git 分支

| 设置 | 选项 | 默认值 | 控制内容 |
|---------|---------|---------|------------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | 何时以及如何创建分支 |
| `git.phase_branch_template` | 模板字符串 | `gsd/phase-{phase}-{slug}` | 阶段策略的分支名 |
| `git.milestone_branch_template` | 模板字符串 | `gsd/{milestone}-{slug}` | 里程碑策略的分支名 |

**分支策略说明：**

| 策略 | 创建分支 | 范围 | 适用于 |
|----------|---------------|-------|----------|
| `none` | 从不 | N/A | 独立开发、简单项目 |
| `phase` | 每次 `execute-phase` | 每个阶段一个分支 | 每阶段代码审查、细粒度回滚 |
| `milestone` | 第一次 `execute-phase` | 所有阶段共享一个分支 | 发布分支、每个版本一个 PR |

**模板变量：** `{phase}` = 零填充数字（如 "03"），`{slug}` = 小写连字符名称，`{milestone}` = 版本（如 "v1.0"）。

### 模型配置（每个代理分解）

| 代理 | `quality` | `balanced` | `budget` |
|-------|-----------|------------|----------|
| gsd-planner | Opus | Opus | Sonnet |
| gsd-roadmapper | Opus | Sonnet | Sonnet |
| gsd-executor | Opus | Sonnet | Sonnet |
| gsd-phase-researcher | Opus | Sonnet | Haiku |
| gsd-project-researcher | Opus | Sonnet | Haiku |
| gsd-research-synthesizer | Sonnet | Sonnet | Haiku |
| gsd-debugger | Opus | Sonnet | Sonnet |
| gsd-codebase-mapper | Sonnet | Haiku | Haiku |
| gsd-verifier | Sonnet | Sonnet | Haiku |
| gsd-plan-checker | Sonnet | Sonnet | Haiku |
| gsd-integration-checker | Sonnet | Sonnet | Haiku |

**配置理念：**
- **quality** —— 所有决策代理使用 Opus，只读验证使用 Sonnet。有配额可用且工作关键时使用。
- **balanced** —— 仅规划（架构决策发生的地方）使用 Opus，其他全部使用 Sonnet。这是默认，有充分理由。
- **budget** —— 编写代码的使用 Sonnet，研究和验证使用 Haiku。大量工作或不太关键的阶段使用。

---

## 使用示例

### 新项目（完整周期）

```bash
claude --dangerously-skip-permissions
/gsd-new-project            # 回答问题，配置，批准路线图
/clear
/gsd-discuss-phase 1        # 锁定你的偏好
/gsd-plan-phase 1           # 研究 + 规划 + 验证
/gsd-execute-phase 1        # 并行执行
/gsd-verify-work 1          # 手动 UAT
/clear
/gsd-discuss-phase 2        # 对每个阶段重复
...
/gsd-audit-milestone        # 检查所有内容已发布
/gsd-complete-milestone     # 归档，标记，完成
```

### 从现有文档创建新项目

```bash
/gsd-new-project --auto @prd.md   # 从你的文档自动运行研究/需求/路线图
/clear
/gsd-discuss-phase 1               # 从这里开始正常流程
```

### 现有代码库

```bash
/gsd-map-codebase           # 分析现有内容（并行代理）
/gsd-new-project            # 问题聚焦于你正在添加的内容
# （从这里开始正常阶段工作流）
```

### 快速 Bug 修复

```bash
/gsd-quick
> "修复移动端 Safari 上登录按钮无响应的问题"
```

### 中断后恢复

```bash
/gsd-progress               # 查看你停在哪和接下来做什么
# 或
/gsd-resume-work            # 从上次会话完整恢复上下文
```

### 准备发布

```bash
/gsd-audit-milestone        # 检查需求覆盖率，检测存根
/gsd-plan-milestone-gaps    # 如果审计发现缺口，创建阶段来填补
/gsd-complete-milestone     # 归档，标记，完成
```

### 速度与质量预设

| 场景 | 模式 | 粒度 | 配置 | 研究 | 计划检查 | 验证器 |
|----------|------|-------|---------|----------|------------|----------|
| 原型开发 | `yolo` | `coarse` | `budget` | 关 | 关 | 关 |
| 正常开发 | `interactive` | `standard` | `balanced` | 开 | 开 | 开 |
| 生产环境 | `interactive` | `fine` | `quality` | 开 | 开 | 开 |

### 里程碑中途范围变更

```bash
/gsd-add-phase              # 向路线图追加新阶段
# 或
/gsd-insert-phase 3         # 在阶段 3 和 4 之间插入紧急工作
# 或
/gsd-remove-phase 7         # 移除阶段 7 并重新编号
```

---

## 故障排除

### "项目已初始化"

你运行了 `/gsd-new-project` 但 `.planning/PROJECT.md` 已存在。这是安全检查。如果你想重新开始，先删除 `.planning/` 目录。

### 长会话期间上下文退化

在主要命令之间清除上下文窗口：Claude Code 中的 `/clear`。GSD 设计围绕全新上下文 —— 每个子代理获得干净的 200K 窗口。如果主会话质量下降，清除并使用 `/gsd-resume-work` 或 `/gsd-progress` 恢复状态。

### 计划看起来错误或不一致

在规划前运行 `/gsd-discuss-phase [N]`。大多数计划质量问题来自 Claude 做出了 `CONTEXT.md` 本可以防止的假设。你也可以运行 `/gsd-list-phase-assumptions [N]` 在提交计划前查看 Claude 打算做什么。

### 执行失败或产生存根

检查计划是否太雄心勃勃。计划最多应有 2-3 个任务。如果任务太大，它们超出了单个上下文窗口可以可靠产生的内容。用更小的范围重新规划。

### 忘记你在哪里

运行 `/gsd-progress`。它读取所有状态文件，准确告诉你位置和下一步。

### 执行后需要更改某些内容

不要重新运行 `/gsd-execute-phase`。使用 `/gsd-quick` 进行针对性修复，或用 `/gsd-verify-work` 通过 UAT 系统识别和修复问题。

### STATE.md 不同步

如果 STATE.md 显示不正确的阶段状态或位置，使用状态一致性命令：

```bash
node gsd-tools.cjs state validate          # 检测 STATE.md 与文件系统之间的偏差
node gsd-tools.cjs state sync --verify     # 预览 sync 将更改的内容
node gsd-tools.cjs state sync              # 从磁盘重建 STATE.md
```

这些命令是 v1.32 新增的，替代了手动编辑 STATE.md。

### 研究门控（Research Gate）

`/gsd-plan-phase` 在规划开始前会检查 RESEARCH.md 是否存在未解决的开放问题。如果存在未解决的问题，规划将被阻止，系统会显示需要解决的具体问题。这防止了基于不完整信息构建计划。

### 模型成本太高

切换到 budget 配置：`/gsd-set-profile budget`。如果领域对你（或 Claude）熟悉，通过 `/gsd-settings` 禁用研究和计划检查代理。

### 处理敏感/私有项目

在 `/gsd-new-project` 期间或通过 `/gsd-settings` 设置 `commit_docs: false`。将 `.planning/` 添加到 `.gitignore`。规划工件保留在本地，从不接触 git。

### 安装器输出语言不符合预期

安装器读取的是**当前工作目录**下 `.planning/config.json` 里的 `response_language`。这会影响 `npx get-shit-done-cc --help`、安装/卸载进度、交互提示、警告和完成消息。

- 如果当前目录没有 `.planning/config.json`，安装器默认输出英文
- 如果你想看到中文安装器输出，请在当前项目目录运行安装器，并确保 `.planning/config.json` 中有 `"response_language": "zh-CN"`
- 命令标志、路径、文件名以及 `Codex`、`Qwen Code`、`CodeBuddy` 这类 runtime 名称仍保持英文，这是刻意保留的 `English canonical` 边界

### GSD 更新覆盖了我的本地更改

从 v1.17 开始，安装程序将本地修改的文件备份到 `gsd-local-patches/`。运行 `/gsd-reapply-patches` 将你的更改合并回来。

### 子代理似乎失败但工作已完成

存在 Claude Code 分类 bug 的已知解决方法。GSD 的编排器（execute-phase、quick）在报告失败前抽查实际输出。如果你看到失败消息但提交已创建，检查 `git log` —— 工作可能已成功。

---

## 恢复快速参考

| 问题 | 解决方案 |
|---------|----------|
| 丢失上下文 / 新会话 | `/gsd-resume-work` 或 `/gsd-progress` |
| 阶段出错 | `git revert` 阶段提交，然后重新规划 |
| 需要更改范围 | `/gsd-add-phase`、`/gsd-insert-phase` 或 `/gsd-remove-phase` |
| 里程碑审计发现缺口 | `/gsd-plan-milestone-gaps` |
| 出问题了 | `/gsd-debug "描述"` |
| STATE.md 不同步 | `state validate` 然后 `state sync` |
| 快速针对性修复 | `/gsd-quick` |
| 计划与你的愿景不符 | `/gsd-discuss-phase [N]` 然后重新规划 |
| 成本过高 | `/gsd-set-profile budget` 和 `/gsd-settings` 关闭代理 |
| 更新破坏了本地更改 | `/gsd-reapply-patches` |

---

## 项目文件结构

供参考，这是 GSD 在你的项目中创建的内容：

```
.planning/
  PROJECT.md              # 项目愿景和上下文（始终加载）
  REQUIREMENTS.md         # 界定 v1/v2 需求及 ID
  ROADMAP.md              # 带状态跟踪的阶段分解
  STATE.md                # 决策、阻塞项、会话记忆
  config.json             # 工作流配置
  MILESTONES.md           # 已完成里程碑归档
  research/               # 来自 /gsd-new-project 的领域研究
  todos/
    pending/              # 等待处理的捕获想法
    done/                 # 已完成的待办事项
  debug/                  # 活跃调试会话
    resolved/             # 已归档的调试会话
  codebase/               # 现有代码库映射（来自 /gsd-map-codebase）
  phases/
    XX-phase-name/
      XX-YY-PLAN.md       # 原子执行计划
      XX-YY-SUMMARY.md    # 执行结果和决策
      CONTEXT.md          # 你的实现偏好
      RESEARCH.md         # 生态研究发现
      VERIFICATION.md     # 执行后验证结果
```
