# GSD 命令摘要

> 本页是 `zh-CN` 命令摘要层，帮助你快速理解主闭环命令的用途、典型时机和阅读路径。完整语法、全部 flags、边缘命令和最新细节请回退到 [English canonical](../COMMANDS.md)。

---

## 这页负责什么

- 提供首批高价值命令的中文摘要，而不是 `commands/gsd/*.md` 的全文 mirror。
- 优先回答“这个命令什么时候用、会产出什么、下一步通常是什么”。
- 对 advanced flags、非首批命令和完整示例，统一回退到 [English canonical](../COMMANDS.md)。
- 命令 ID、路径、代码、frontmatter、tool names 和关键技术术语继续保留英文。

## 命令语法

- **Claude Code / Gemini / Copilot:** `/gsd-command-name [args]`
- **OpenCode / Kilo:** `/gsd-command-name [args]`
- **Codex:** `$gsd-command-name [args]`

## 主闭环命令

| Command | 什么时候用 | 你会得到什么 | 进一步阅读 |
|---------|------------|--------------|------------|
| `/gsd-progress` | 想先确认项目当前在哪个 phase、最近做了什么、下一步该做什么时 | 进度摘要、当前 focus、推荐路由 | [English canonical](../COMMANDS.md) |
| `/gsd-discuss-phase [N]` | 准备开始某个 phase，但实现边界、优先级或策略还没锁定时 | `{phase}-CONTEXT.md` 与讨论记录 | [English canonical](../COMMANDS.md) |
| `/gsd-plan-phase [N]` | context 已经足够，需要把 phase 拆成可执行计划时 | `RESEARCH.md`、`PLAN.md`、`VALIDATION.md` | [English canonical](../COMMANDS.md) |
| `/gsd-execute-phase <N>` | phase 已有计划，准备真正落地执行时 | per-plan `SUMMARY.md`，phase 完成后生成 `VERIFICATION.md` | [English canonical](../COMMANDS.md) |
| `/gsd-next` | 不想手动判断下一步命令，想让系统根据状态自动推进时 | 自动路由到 discuss、plan、execute 或 verify | [English canonical](../COMMANDS.md) |

## 五个首批命令的使用指引

### `/gsd-progress`

- 适合 session 开头、切换上下文之后，或你怀疑 `STATE.md` 与真实工作面有偏差时先跑一遍。
- 重点价值不是“列所有文件”，而是把 recent work、当前 phase 与 next action 收敛成可执行判断。
- 如果你只是想继续当前链路，通常会从这里跳到 `discuss-phase`、`plan-phase` 或 `execute-phase`。

### `/gsd-discuss-phase [N]`

- 在 planning 之前锁实现决策，避免 planner 再次向你追问同一个灰区。
- 适合回答“这阶段到底要做多深”“哪些内容先不做”“哪些规则保持英文 canonical”这类问题。
- 常见参数如 `--auto`、`--batch`、`--analyze`、`--power` 会改变讨论方式；详细行为请看 [English canonical](../COMMANDS.md)。

### `/gsd-plan-phase [N]`

- 当 `CONTEXT.md` 已经足够明确时使用，把 phase 变成带验证闭环的 `PLAN.md`。
- 它会把 research、planning、plan check 串起来，产出后续执行所需的事实源和计划文件。
- `--research`、`--skip-research`、`--gaps`、`--skip-verify` 等 advanced flags 不在本页展开，统一回退到 [English canonical](../COMMANDS.md)。

### `/gsd-execute-phase <N>`

- 在 phase 已经存在 `PLAN.md` 时使用，按 wave 顺序执行并生成 `SUMMARY.md`。
- 对小计划通常适合顺序 inline 执行；更大 phase 则可能进入 wave-based parallelization。
- 本页只解释用途和定位，不复制执行工作流细节；完整参数与行为请看 [English canonical](../COMMANDS.md)。

### `/gsd-next`

- 当你不确定该手动执行哪个命令时使用，它会根据 `.planning/` 当前状态自动路由。
- 它对多项目切换、跨 session 恢复和连续推进特别有价值。
- 如果前序 phase 有未完成工作，它也会优先暴露这些缺口，而不是盲目前进。

## 这页不覆盖的内容

- 非首批命令的逐条说明
- 所有 flags、options 和 examples 的完整表
- `commands/gsd/*.md` 中的 workflow/process/control-flow 正文
- 面向维护者的底层 tool contracts

这些内容都应回退到 [English canonical](../COMMANDS.md)。
