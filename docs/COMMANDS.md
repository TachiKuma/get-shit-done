# GSD-CN 命令参考

> `gsdcn-*` 命令的语法、标志、选项与示例。功能详情见 [Feature Reference](FEATURES.md)，工作流演示见 [用户指南](USER-GUIDE.md)。
>
> **关于 GSD-CN：** 本文档适用于 `GSD-CN` 中文发行版，所有用户可见命令使用 `gsdcn-*` 前缀。

---

## 命令语法

- **Claude Code / Gemini / Copilot：** `/gsdcn-command-name [args]`
- **OpenCode / Kilo：** `/gsdcn-command-name [args]`
- **Codex：** `$gsdcn-command-name [args]`

---

## Core Workflow Commands

### `/gsdcn-new-project`

Initialize a new project with deep context gathering.

| Flag | Description |
|------|-------------|
| `--auto @file.md` | Auto-extract from document, skip interactive questions |

**Prerequisites:** No existing `.planning/PROJECT.md`
**Produces:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `config.json`, `research/`, `CLAUDE.md`

```bash
/gsdcn-new-project                    # Interactive mode
/gsdcn-new-project --auto @prd.md     # Auto-extract from PRD
```

---

### `/gsdcn-new-workspace`

Create an isolated workspace with repo copies and independent `.planning/` directory.

| Flag | Description |
|------|-------------|
| `--name <name>` | Workspace name (required) |
| `--repos repo1,repo2` | Comma-separated repo paths or names |
| `--path /target` | Target directory (default: `~/gsdcn-workspaces/<name>`) |
| `--strategy worktree\|clone` | Copy strategy (default: `worktree`) |
| `--branch <name>` | Branch to checkout (default: `workspace/<name>`) |
| `--auto` | Skip interactive questions |

**Use cases:**
- Multi-repo: work on a subset of repos with isolated GSD state
- Feature isolation: `--repos .` creates a worktree of the current repo

**Produces:** `WORKSPACE.md`, `.planning/`, repo copies (worktrees or clones)

```bash
/gsdcn-new-workspace --name feature-b --repos hr-ui,ZeymoAPI
/gsdcn-new-workspace --name feature-b --repos . --strategy worktree  # Same-repo isolation
/gsdcn-new-workspace --name spike --repos api,web --strategy clone   # Full clones
```

---

### `/gsdcn-list-workspaces`

List active GSD workspaces and their status.

**Scans:** `~/gsdcn-workspaces/` for `WORKSPACE.md` manifests
**Shows:** Name, repo count, strategy, GSD project status

```bash
/gsdcn-list-workspaces
```

---

### `/gsdcn-remove-workspace`

Remove a workspace and clean up git worktrees.

| Argument | Required | Description |
|----------|----------|-------------|
| `<name>` | Yes | Workspace name to remove |

**Safety:** Refuses removal if any repo has uncommitted changes. Requires name confirmation.

```bash
/gsdcn-remove-workspace feature-b
```

---

### `/gsdcn-discuss-phase`

Capture implementation decisions before planning.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number (defaults to current phase) |

| Flag | Description |
|------|-------------|
| `--all` | Skip area selection — discuss all gray areas interactively (no auto-advance) |
| `--auto` | Auto-select recommended defaults for all questions |
| `--batch` | Group questions for batch intake instead of one-by-one |
| `--analyze` | Add trade-off analysis during discussion |
| `--power` | File-based bulk question answering from a prepared answers file |

**Prerequisites:** `.planning/ROADMAP.md` exists
**Produces:** `{phase}-CONTEXT.md`, `{phase}-DISCUSSION-LOG.md` (audit trail)

```bash
/gsdcn-discuss-phase 1                # Interactive discussion for phase 1
/gsdcn-discuss-phase 1 --all          # Discuss all gray areas without selection step
/gsdcn-discuss-phase 3 --auto         # Auto-select defaults for phase 3
/gsdcn-discuss-phase --batch          # Batch mode for current phase
/gsdcn-discuss-phase 2 --analyze      # Discussion with trade-off analysis
/gsdcn-discuss-phase 1 --power        # Bulk answers from file
```

---

### `/gsdcn-ui-phase`

Generate UI design contract for frontend phases.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number (defaults to current phase) |

**Prerequisites:** `.planning/ROADMAP.md` exists, phase has frontend/UI work
**Produces:** `{phase}-UI-SPEC.md`

```bash
/gsdcn-ui-phase 2                     # Design contract for phase 2
```

---

### `/gsdcn-plan-phase`

Research, plan, and verify a phase.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number (defaults to next unplanned phase) |

| Flag | Description |
|------|-------------|
| `--auto` | Skip interactive confirmations |
| `--research` | Force re-research even if RESEARCH.md exists |
| `--skip-research` | Skip domain research step |
| `--gaps` | Gap closure mode (reads VERIFICATION.md, skips research) |
| `--skip-verify` | Skip plan checker verification loop |
| `--prd <file>` | Use a PRD file instead of discuss-phase for context |
| `--reviews` | Replan with cross-AI review feedback from REVIEWS.md |
| `--validate` | Run state validation before planning begins |
| `--bounce` | Run external plan bounce validation after planning (uses `workflow.plan_bounce_script`) |
| `--skip-bounce` | Skip plan bounce even if enabled in config |

**Prerequisites:** `.planning/ROADMAP.md` exists
**Produces:** `{phase}-RESEARCH.md`, `{phase}-{N}-PLAN.md`, `{phase}-VALIDATION.md`

```bash
/gsdcn-plan-phase 1                   # Research + plan + verify phase 1
/gsdcn-plan-phase 3 --skip-research   # Plan without research (familiar domain)
/gsdcn-plan-phase --auto              # Non-interactive planning
/gsdcn-plan-phase 2 --validate        # Validate state before planning
/gsdcn-plan-phase 1 --bounce          # Plan + external bounce validation
```

---

### `/gsdcn-plan-review-convergence`

Cross-AI plan convergence loop. Runs `plan-phase → review → replan → re-review` cycles until no HIGH concerns remain (max 3 cycles by default). Spawns isolated agents for planning and review; orchestrator handles loop control, HIGH-concern counting, stall detection, and escalation.

| Argument / Flag | Required | Description |
|-----------------|----------|-------------|
| `N` | **Yes** | Phase number to plan and review |
| `--codex` / `--gemini` / `--claude` / `--opencode` | No | Single-reviewer selection |
| `--all` | No | Run every configured reviewer in parallel |
| `--max-cycles N` | No | Override cycle cap (default 3) |

**Exit behavior:** Loop exits when HIGH count hits zero. Stall detection warns when HIGH count is not decreasing across cycles. Escalation gate asks the user to proceed or review manually when `--max-cycles` is hit with HIGH concerns still open.

```bash
/gsdcn-plan-review-convergence 3                    # Default reviewers, 3 cycles
/gsdcn-plan-review-convergence 3 --codex            # Codex-only review
/gsdcn-plan-review-convergence 3 --all --max-cycles 5
```

---

### `/gsdcn-ultraplan-phase`

**[BETA — Claude Code only.]** Offload plan-phase work to Claude Code's ultraplan cloud. The plan drafts remotely so the terminal stays free; review inline comments in a browser, then import the finalized plan back into `.planning/` via `/gsdcn-import`.

| Flag | Required | Description |
|------|----------|-------------|
| `N` | **Yes** | Phase number to plan remotely |

**Isolation:** Intentionally separate from `/gsdcn-plan-phase` so upstream ultraplan changes cannot affect the core planning pipeline.

```bash
/gsdcn-ultraplan-phase 4                  # Offload planning for phase 4
```

---

### `/gsdcn-execute-phase`

Execute all plans in a phase with wave-based parallelization, or run a specific wave.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | **Yes** | Phase number to execute |
| `--wave N` | No | Execute only Wave `N` in the phase |
| `--validate` | No | Run state validation before execution begins |
| `--cross-ai` | No | Delegate execution to an external AI CLI (uses `workflow.cross_ai_command`) |
| `--no-cross-ai` | No | Force local execution even if cross-AI is enabled in config |

**Prerequisites:** Phase has PLAN.md files
**Produces:** per-plan `{phase}-{N}-SUMMARY.md`, git commits, and `{phase}-VERIFICATION.md` when the phase is fully complete

```bash
/gsdcn-execute-phase 1                # Execute phase 1
/gsdcn-execute-phase 1 --wave 2       # Execute only Wave 2
/gsdcn-execute-phase 1 --validate     # Validate state before execution
/gsdcn-execute-phase 2 --cross-ai     # Delegate phase 2 to external AI CLI
```

---

### `/gsdcn-verify-work`

User acceptance testing with auto-diagnosis.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number (defaults to last executed phase) |

**Prerequisites:** Phase has been executed
**Produces:** `{phase}-UAT.md`, fix plans if issues found

```bash
/gsdcn-verify-work 1                  # UAT for phase 1
```

---

### `/gsdcn-next`

Automatically advance to the next logical workflow step. Reads project state and runs the appropriate command.

**Prerequisites:** `.planning/` directory exists
**Behavior:**
- No project → suggests `/gsdcn-new-project`
- Phase needs discussion → runs `/gsdcn-discuss-phase`
- Phase needs planning → runs `/gsdcn-plan-phase`
- Phase needs execution → runs `/gsdcn-execute-phase`
- Phase needs verification → runs `/gsdcn-verify-work`
- All phases complete → suggests `/gsdcn-complete-milestone`

```bash
/gsdcn-next                           # Auto-detect and run next step
```

---

### `/gsdcn-session-report`

Generate a session report with work summary, outcomes, and estimated resource usage.

**Prerequisites:** Active project with recent work
**Produces:** `.planning/reports/SESSION_REPORT.md`

```bash
/gsdcn-session-report                 # Generate post-session summary
```

**Report includes:**
- Work performed (commits, plans executed, phases progressed)
- Outcomes and deliverables
- Blockers and decisions made
- Estimated token/cost usage
- Next steps recommendation

---

### `/gsdcn-ship`

Create PR from completed phase work with auto-generated body.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number or milestone version (e.g., `4` or `v1.0`) |
| `--draft` | No | Create as draft PR |

**Prerequisites:** Phase verified (`/gsdcn-verify-work` passed), `gh` CLI installed and authenticated
**Produces:** GitHub PR with rich body from planning artifacts, STATE.md updated

```bash
/gsdcn-ship 4                         # Ship phase 4
/gsdcn-ship 4 --draft                 # Ship as draft PR
```

**PR body includes:**
- Phase goal from ROADMAP.md
- Changes summary from SUMMARY.md files
- Requirements addressed (REQ-IDs)
- Verification status
- Key decisions

---

### `/gsdcn-ui-review`

Retroactive 6-pillar visual audit of implemented frontend.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number (defaults to last executed phase) |

**Prerequisites:** Project has frontend code (works standalone, no GSD project needed)
**Produces:** `{phase}-UI-REVIEW.md`, screenshots in `.planning/ui-reviews/`

```bash
/gsdcn-ui-review                      # Audit current phase
/gsdcn-ui-review 3                    # Audit phase 3
```

---

### `/gsdcn-audit-uat`

Cross-phase audit of all outstanding UAT and verification items.

**Prerequisites:** At least one phase has been executed with UAT or verification
**Produces:** Categorized audit report with human test plan

```bash
/gsdcn-audit-uat
```

---

### `/gsdcn-audit-milestone`

Verify milestone met its definition of done.

**Prerequisites:** All phases executed
**Produces:** Audit report with gap analysis

```bash
/gsdcn-audit-milestone
```

---

### `/gsdcn-complete-milestone`

Archive milestone, tag release.

**Prerequisites:** Milestone audit complete (recommended)
**Produces:** `MILESTONES.md` entry, git tag

```bash
/gsdcn-complete-milestone
```

---

### `/gsdcn-milestone-summary`

Generate comprehensive project summary from milestone artifacts for team onboarding and review.

| Argument | Required | Description |
|----------|----------|-------------|
| `version` | No | Milestone version (defaults to current/latest milestone) |

**Prerequisites:** At least one completed or in-progress milestone
**Produces:** `.planning/reports/MILESTONE_SUMMARY-v{version}.md`

**Summary includes:**
- Overview, architecture decisions, phase-by-phase breakdown
- Key decisions and trade-offs
- Requirements coverage
- Tech debt and deferred items
- Getting started guide for new team members
- Interactive Q&A offered after generation

```bash
/gsdcn-milestone-summary                # Summarize current milestone
/gsdcn-milestone-summary v1.0           # Summarize specific milestone
```

---

### `/gsdcn-new-milestone`

Start next version cycle.

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Milestone name |
| `--reset-phase-numbers` | No | Restart the new milestone at Phase 1 and archive old phase dirs before roadmapping |

**Prerequisites:** Previous milestone completed
**Produces:** Updated `PROJECT.md`, new `REQUIREMENTS.md`, new `ROADMAP.md`

```bash
/gsdcn-new-milestone                  # Interactive
/gsdcn-new-milestone "v2.0 Mobile"    # Named milestone
/gsdcn-new-milestone --reset-phase-numbers "v2.0 Mobile"  # Restart milestone numbering at 1
```

---

## Phase Management Commands

### `/gsdcn-add-phase`

Append new phase to roadmap.

```bash
/gsdcn-add-phase                      # Interactive — describe the phase
```

### `/gsdcn-insert-phase`

Insert urgent work between phases using decimal numbering.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Insert after this phase number |

```bash
/gsdcn-insert-phase 3                 # Insert between phase 3 and 4 → creates 3.1
```

### `/gsdcn-remove-phase`

Remove future phase and renumber subsequent phases.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number to remove |

```bash
/gsdcn-remove-phase 7                 # Remove phase 7, renumber 8→7, 9→8, etc.
```

### `/gsdcn-list-phase-assumptions`

Preview Claude's intended approach before planning.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number |

```bash
/gsdcn-list-phase-assumptions 2       # See assumptions for phase 2
```

### `/gsdcn-analyze-dependencies`

Analyze phase dependencies and suggest `Depends on` entries for ROADMAP.md before running `/gsdcn-manager`.

**Prerequisites:** `.planning/ROADMAP.md` exists
**Produces:** Dependency suggestion table; optionally updates `Depends on` fields in ROADMAP.md with confirmation

**Run this before `/gsdcn-manager`** when phases have empty `Depends on` fields and you want to avoid merge conflicts from unordered parallel execution.

```bash
/gsdcn-analyze-dependencies           # Analyze all phases and suggest dependencies
```

**Detection methods:**
- File overlap — phases touching the same files/domains must be ordered
- Semantic dependencies — a phase that consumes an API or schema built by another phase
- Data flow — a phase that reads output produced by another phase

---

### `/gsdcn-plan-milestone-gaps`

Create phases to close gaps from milestone audit.

```bash
/gsdcn-plan-milestone-gaps             # Creates phases for each audit gap
```

### `/gsdcn-research-phase`

Deep ecosystem research only (standalone — usually use `/gsdcn-plan-phase` instead).

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number |

```bash
/gsdcn-research-phase 4               # Research phase 4 domain
```

### `/gsdcn-validate-phase`

Retroactively audit and fill Nyquist validation gaps.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number |

```bash
/gsdcn-validate-phase 2               # Audit test coverage for phase 2
```

---

## Navigation Commands

### `/gsdcn-progress`

Show status and next steps.

| Flag | Description |
|------|-------------|
| `--forensic` | Append a 6-check integrity audit after the standard report (STATE consistency, orphaned handoffs, deferred scope drift, memory-flagged pending work, blocking todos, uncommitted code) |

```bash
/gsdcn-progress                       # "Where am I? What's next?"
/gsdcn-progress --forensic            # Standard report + integrity audit
```

### `/gsdcn-resume-work`

Restore full context from last session.

```bash
/gsdcn-resume-work                    # After context reset or new session
```

### `/gsdcn-pause-work`

Save context handoff when stopping mid-phase.

```bash
/gsdcn-pause-work                     # Creates continue-here.md
```

### `/gsdcn-manager`

Interactive command center for managing multiple phases from one terminal.

**Prerequisites:** `.planning/ROADMAP.md` exists
**Behavior:**
- Dashboard of all phases with visual status indicators
- Recommends optimal next actions based on dependencies and progress
- Dispatches work: discuss runs inline, plan/execute run as background agents
- Designed for power users parallelizing work across phases from one terminal
- Supports per-step passthrough flags via `manager.flags` config (see [Configuration](CONFIGURATION.md#manager-passthrough-flags))

```bash
/gsdcn-manager                        # Open command center dashboard
```

**Manager Passthrough Flags:**

Configure per-step flags in `.planning/config.json` under `manager.flags`. These flags are appended to each dispatched command:

```json
{
  "manager": {
    "flags": {
      "discuss": "--auto",
      "plan": "--skip-research",
      "execute": "--validate"
    }
  }
}
```

---

### `/gsdcn-help`

Show all commands and usage guide.

```bash
/gsdcn-help                           # Quick reference
```

---

## Utility Commands

### `/gsdcn-explore`

Socratic ideation session — guide an idea through probing questions, optionally spawn research, then route output to the right GSD artifact (notes, todos, seeds, research questions, requirements, or a new phase).

| Argument | Required | Description |
|----------|----------|-------------|
| `topic` | No | Topic to explore (e.g., `/gsdcn-explore authentication strategy`) |

```bash
/gsdcn-explore                        # Open-ended ideation session
/gsdcn-explore authentication strategy  # Explore a specific topic
```

---

### `/gsdcn-undo`

Safe git revert — roll back GSD phase or plan commits using the phase manifest with dependency checks and a confirmation gate.

| Flag | Required | Description |
|------|----------|-------------|
| `--last N` | (one of three required) | Show recent GSD commits for interactive selection |
| `--phase NN` | (one of three required) | Revert all commits for a phase |
| `--plan NN-MM` | (one of three required) | Revert all commits for a specific plan |

**Safety:** Checks dependent phases/plans before reverting; always shows a confirmation gate.

```bash
/gsdcn-undo --last 5                  # Pick from the 5 most recent GSD commits
/gsdcn-undo --phase 03                # Revert all commits for phase 3
/gsdcn-undo --plan 03-02              # Revert commits for plan 02 of phase 3
```

---

### `/gsdcn-import`

Ingest an external plan file into the GSD planning system with conflict detection against `PROJECT.md` decisions before writing anything.

| Flag | Required | Description |
|------|----------|-------------|
| `--from <filepath>` | **Yes** | Path to the external plan file to import |

**Process:** Detects conflicts → prompts for resolution → writes as GSD PLAN.md → validates via `gsd-plan-checker`

```bash
/gsdcn-import --from /tmp/team-plan.md  # Import and validate an external plan
```

---

### `/gsdcn-ingest-docs`

Scan a repo containing mixed ADRs, PRDs, SPECs, and DOCs and bootstrap or merge the full `.planning/` setup from them in a single pass. Parallel classification (`gsd-doc-classifier`) plus synthesis with precedence rules and cycle detection (`gsd-doc-synthesizer`). Produces a three-bucket conflicts report (`INGEST-CONFLICTS.md`: auto-resolved, competing-variants, unresolved-blockers) and hard-blocks on LOCKED-vs-LOCKED ADR contradictions.

| Argument / Flag | Required | Description |
|-----------------|----------|-------------|
| `path` | No | Target directory to scan (defaults to repo root) |
| `--mode new\|merge` | No | Override auto-detect (defaults: `new` if `.planning/` absent, `merge` if present) |
| `--manifest <file>` | No | YAML file listing `{path, type, precedence?}` per doc; overrides heuristic classification |
| `--resolve auto` | No | Conflict resolution mode (v1: only `auto`; `interactive` is reserved) |

**Limits:** v1 caps at 50 docs per invocation. Extracts the shared conflict-detection contract into `references/doc-conflict-engine.md`, which `/gsdcn-import` also consumes.

```bash
/gsdcn-ingest-docs                            # Scan repo root, auto-detect mode
/gsdcn-ingest-docs docs/                      # Only ingest under docs/
/gsdcn-ingest-docs --manifest ingest.yaml     # Explicit precedence manifest
```

---

### `/gsdcn-from-gsd2`

Reverse migration from GSD-2 format (`.gsd/` with Milestone→Slice→Task hierarchy) back to v1 `.planning/` format.

| Flag | Required | Description |
|------|----------|-------------|
| `--dry-run` | No | Preview what would be migrated without writing anything |
| `--force` | No | Overwrite existing `.planning/` directory |
| `--path <dir>` | No | Specify GSD-2 root directory (defaults to current directory) |

**Flattening:** Milestone→Slice hierarchy is flattened to sequential phase numbers (M001/S01→phase 01, M001/S02→phase 02, M002/S01→phase 03, etc.).

**Produces:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and sequential phase directories in `.planning/`.

**Safety:** Guards against overwriting an existing `.planning/` directory without `--force`.

```bash
/gsdcn-from-gsd2                          # Migrate .gsd/ in current directory
/gsdcn-from-gsd2 --dry-run                # Preview migration without writing
/gsdcn-from-gsd2 --force                  # Overwrite existing .planning/
/gsdcn-from-gsd2 --path /path/to/gsd2-project  # Specify GSD-2 root
```

---

### `/gsdcn-quick`

Execute ad-hoc task with GSD guarantees.

| Flag | Description |
|------|-------------|
| `--full` | Enable the complete quality pipeline — discussion + research + plan-checking + verification |
| `--validate` | Plan-checking (max 2 iterations) + post-execution verification only; no discussion or research |
| `--discuss` | Lightweight pre-planning discussion |
| `--research` | Spawn focused researcher before planning |

Granular flags are composable: `--discuss --research --validate` is equivalent to `--full`.

| Subcommand | Description |
|------------|-------------|
| `list` | List all quick tasks with status |
| `status <slug>` | Show status of a specific quick task |
| `resume <slug>` | Resume a specific quick task by slug |

```bash
/gsdcn-quick                          # Basic quick task
/gsdcn-quick --discuss --research     # Discussion + research + planning
/gsdcn-quick --validate               # Plan-checking + verification only
/gsdcn-quick --full                   # Complete quality pipeline
/gsdcn-quick list                     # List all quick tasks
/gsdcn-quick status my-task-slug      # Show status of a quick task
/gsdcn-quick resume my-task-slug      # Resume a quick task
```

### `/gsdcn-autonomous`

Run all remaining phases autonomously.

| Flag | Description |
|------|-------------|
| `--from N` | Start from a specific phase number |
| `--to N` | Stop after completing a specific phase number |
| `--interactive` | Lean context with user input |

```bash
/gsdcn-autonomous                     # Run all remaining phases
/gsdcn-autonomous --from 3            # Start from phase 3
/gsdcn-autonomous --to 5              # Run up to and including phase 5
/gsdcn-autonomous --from 3 --to 5     # Run phases 3 through 5
```

### `/gsdcn-do`

Route freeform text to the right GSD command.

```bash
/gsdcn-do                             # Then describe what you want
```

### `/gsdcn-note`

Zero-friction idea capture — append, list, or promote notes to todos.

| Argument | Required | Description |
|----------|----------|-------------|
| `text` | No | Note text to capture (default: append mode) |
| `list` | No | List all notes from project and global scopes |
| `promote N` | No | Convert note N into a structured todo |

| Flag | Description |
|------|-------------|
| `--global` | Use global scope for note operations |

```bash
/gsdcn-note "Consider caching strategy for API responses"
/gsdcn-note list
/gsdcn-note promote 3
```

### `/gsdcn-debug`

Systematic debugging with persistent state.

| Argument | Required | Description |
|----------|----------|-------------|
| `description` | No | Description of the bug |

| Flag | Description |
|------|-------------|
| `--diagnose` | Diagnosis-only mode — investigate without attempting fixes |

**Subcommands:**
- `/gsdcn-debug list` — List all active debug sessions with status, hypothesis, and next action
- `/gsdcn-debug status <slug>` — Print full summary of a session (Evidence count, Eliminated count, Resolution, TDD checkpoint) without spawning an agent
- `/gsdcn-debug continue <slug>` — Resume a specific session by slug (surfaces Current Focus then spawns continuation agent)
- `/gsdcn-debug [--diagnose] <description>` — Start new debug session (existing behavior; `--diagnose` stops at root cause without applying fix)

**TDD mode:** When `tdd_mode: true` in `.planning/config.json`, debug sessions require a failing test to be written and verified before any fix is applied (red → green → done).

```bash
/gsdcn-debug "Login button not responding on mobile Safari"
/gsdcn-debug --diagnose "Intermittent 500 errors on /api/users"
/gsdcn-debug list
/gsdcn-debug status auth-token-null
/gsdcn-debug continue form-submit-500
```

### `/gsdcn-add-todo`

Capture idea or task for later.

| Argument | Required | Description |
|----------|----------|-------------|
| `description` | No | Todo description |

```bash
/gsdcn-add-todo "Consider adding dark mode support"
```

### `/gsdcn-check-todos`

List pending todos and select one to work on.

```bash
/gsdcn-check-todos
```

### `/gsdcn-add-tests`

Generate tests for a completed phase.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | No | Phase number |

```bash
/gsdcn-add-tests 2                    # Generate tests for phase 2
```

### `/gsdcn-stats`

Display project statistics.

```bash
/gsdcn-stats                          # Project metrics dashboard
```

### `/gsdcn-profile-user`

Generate a developer behavioral profile from Claude Code session analysis across 8 dimensions (communication style, decision patterns, debugging approach, UX preferences, vendor choices, frustration triggers, learning style, explanation depth). Produces artifacts that personalize Claude's responses.

| Flag | Description |
|------|-------------|
| `--questionnaire` | Use interactive questionnaire instead of session analysis |
| `--refresh` | Re-analyze sessions and regenerate profile |

**Generated artifacts:**
- `USER-PROFILE.md` — Full behavioral profile
- `/gsdcn-dev-preferences` command — Load preferences in any session
- `CLAUDE.md` profile section — Auto-discovered by Claude Code

```bash
/gsdcn-profile-user                   # Analyze sessions and build profile
/gsdcn-profile-user --questionnaire   # Interactive questionnaire fallback
/gsdcn-profile-user --refresh         # Re-generate from fresh analysis
```

### `/gsdcn-health`

Validate `.planning/` directory integrity.

| Flag | Description |
|------|-------------|
| `--repair` | Auto-fix recoverable issues |

```bash
/gsdcn-health                         # Check integrity
/gsdcn-health --repair                # Check and fix
```

### `/gsdcn-cleanup`

Archive accumulated phase directories from completed milestones.

```bash
/gsdcn-cleanup
```

---

## Spiking & Sketching Commands

### `/gsdcn-spike`

Run 2–5 focused feasibility experiments before committing to an implementation approach. Each experiment uses Given/When/Then framing, produces executable code, and returns a VALIDATED / INVALIDATED / PARTIAL verdict.

| Argument | Required | Description |
|----------|----------|-------------|
| `idea` | No | The technical question or approach to investigate |
| `--quick` | No | Skip intake conversation; use `idea` text directly |

**Produces:** `.planning/spikes/NNN-experiment-name/` with code, results, and README; `.planning/spikes/MANIFEST.md`

```bash
/gsdcn-spike                              # Interactive intake
/gsdcn-spike "can we stream LLM tokens through SSE"
/gsdcn-spike --quick websocket-vs-polling
```

---

### `/gsdcn-spike-wrap-up`

Package completed spike findings into a reusable project-local skill so future sessions can reference the conclusions.

**Prerequisites:** `.planning/spikes/` exists with at least one completed spike
**Produces:** `.claude/skills/spike-findings-[project]/` skill file

```bash
/gsdcn-spike-wrap-up
```

---

### `/gsdcn-sketch`

Explore design directions through throwaway HTML mockups before committing to implementation. Produces 2–3 variants per design question for direct browser comparison.

| Argument | Required | Description |
|----------|----------|-------------|
| `idea` | No | The UI design question or direction to explore |
| `--quick` | No | Skip mood intake; use `idea` text directly |
| `--text` | No | Text-mode fallback — replace interactive prompts with numbered lists (for non-Claude runtimes) |

**Produces:** `.planning/sketches/NNN-descriptive-name/index.html` (2–3 interactive variants), `README.md`, shared `themes/default.css`; `.planning/sketches/MANIFEST.md`

```bash
/gsdcn-sketch                             # Interactive mood intake
/gsdcn-sketch "dashboard layout"
/gsdcn-sketch --quick "sidebar navigation"
/gsdcn-sketch --text "onboarding flow"    # Non-Claude runtime
```

---

### `/gsdcn-sketch-wrap-up`

Package winning sketch decisions into a reusable project-local skill so future sessions inherit the visual direction.

**Prerequisites:** `.planning/sketches/` exists with at least one completed sketch (winner marked)
**Produces:** `.claude/skills/sketch-findings-[project]/` skill file

```bash
/gsdcn-sketch-wrap-up
```

---

## Diagnostics Commands

### `/gsdcn-forensics`

Post-mortem investigation of failed or stuck GSD workflows.

| Argument | Required | Description |
|----------|----------|-------------|
| `description` | No | Problem description (prompted if omitted) |

**Prerequisites:** `.planning/` directory exists
**Produces:** `.planning/forensics/report-{timestamp}.md`

**Investigation covers:**
- Git history analysis (recent commits, stuck patterns, time gaps)
- Artifact integrity (expected files for completed phases)
- STATE.md anomalies and session history
- Uncommitted work, conflicts, abandoned changes
- At least 4 anomaly types checked (stuck loop, missing artifacts, abandoned work, crash/interruption)
- GitHub issue creation offered if actionable findings exist

```bash
/gsdcn-forensics                              # Interactive — prompted for problem
/gsdcn-forensics "Phase 3 execution stalled"  # With problem description
```

---

### `/gsdcn-extract-learnings`

Extract reusable patterns, anti-patterns, and architectural decisions from completed phase work.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | **Yes** | Phase number to extract learnings from |

| Flag | Description |
|------|-------------|
| `--all` | Extract learnings from all completed phases |
| `--format` | Output format: `markdown` (default), `json` |

**Prerequisites:** Phase has been executed (SUMMARY.md files exist)
**Produces:** `.planning/learnings/{phase}-LEARNINGS.md`

**Extracts:**
- Architectural decisions and their rationale
- Patterns that worked well (reusable in future phases)
- Anti-patterns encountered and how they were resolved
- Technology-specific insights
- Performance and testing observations

```bash
/gsdcn-extract-learnings 3                    # Extract learnings from phase 3
/gsdcn-extract-learnings --all                # Extract from all completed phases
```

---

## Workstream Management

### `/gsdcn-workstreams`

Manage parallel workstreams for concurrent work on different milestone areas.

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `list` | List all workstreams with status (default if no subcommand) |
| `create <name>` | Create a new workstream |
| `status <name>` | Detailed status for one workstream |
| `switch <name>` | Set active workstream |
| `progress` | Progress summary across all workstreams |
| `complete <name>` | Archive a completed workstream |
| `resume <name>` | Resume work in a workstream |

**Prerequisites:** Active GSD project
**Produces:** Workstream directories under `.planning/`, state tracking per workstream

```bash
/gsdcn-workstreams                    # List all workstreams
/gsdcn-workstreams create backend-api # Create new workstream
/gsdcn-workstreams switch backend-api # Set active workstream
/gsdcn-workstreams status backend-api # Detailed status
/gsdcn-workstreams progress           # Cross-workstream progress overview
/gsdcn-workstreams complete backend-api  # Archive completed workstream
/gsdcn-workstreams resume backend-api    # Resume work in workstream
```

---

## Configuration Commands

### `/gsdcn-settings`

Interactive configuration of workflow toggles and model profile.

```bash
/gsdcn-settings                       # Interactive config
```

### `/gsdcn-set-profile`

Quick profile switch.

| Argument | Required | Description |
|----------|----------|-------------|
| `profile` | **Yes** | `quality`, `balanced`, `budget`, or `inherit` |

```bash
/gsdcn-set-profile budget             # Switch to budget profile
/gsdcn-set-profile quality            # Switch to quality profile
```

---

## Brownfield Commands

### `/gsdcn-map-codebase`

Analyze existing codebase with parallel mapper agents.

| Argument | Required | Description |
|----------|----------|-------------|
| `area` | No | Scope mapping to a specific area |

```bash
/gsdcn-map-codebase                   # Full codebase analysis
/gsdcn-map-codebase auth              # Focus on auth area
```

---

### `/gsdcn-scan`

Rapid single-focus codebase assessment — lightweight alternative to `/gsdcn-map-codebase` that spawns one mapper agent instead of four parallel ones.

| Flag | Description |
|------|-------------|
| `--focus tech\|arch\|quality\|concerns\|tech+arch` | Focus area (default: `tech+arch`) |

**Produces:** Targeted document(s) in `.planning/codebase/`

```bash
/gsdcn-scan                           # Quick tech + arch overview
/gsdcn-scan --focus quality           # Quality and code health only
/gsdcn-scan --focus concerns          # Surface concerns and risk areas
```

---

### `/gsdcn-intel`

Query, inspect, or refresh queryable codebase intelligence files stored in `.planning/intel/`. Requires `intel.enabled: true` in `config.json`.

| Argument | Description |
|----------|-------------|
| `query <term>` | Search intel files for a term |
| `status` | Show intel file freshness (FRESH/STALE) |
| `diff` | Show changes since last snapshot |
| `refresh` | Rebuild all intel files from codebase analysis |

**Produces:** `.planning/intel/` JSON files (stack, api-map, dependency-graph, file-roles, arch-decisions)

```bash
/gsdcn-intel status                   # Check freshness of intel files
/gsdcn-intel query authentication     # Search intel for a term
/gsdcn-intel diff                     # What changed since last snapshot
/gsdcn-intel refresh                  # Rebuild intel index
```

### `/gsdcn-graphify`

Build, query, and inspect the project knowledge graph stored in `.planning/graphs/`. Opt-in via `graphify.enabled: true` in `config.json` (see [Configuration Reference](CONFIGURATION.md#graphify-settings)); when disabled, the command prints an activation hint and stops.

| Subcommand | Description |
|------------|-------------|
| `build` | Build or rebuild the knowledge graph (spawns the graphify-builder agent) |
| `query <term>` | Search the graph for a term |
| `status` | Show graph freshness and statistics |
| `diff` | Show changes since the last build |

**Produces:** `.planning/graphs/` graph artifacts (nodes, edges, snapshots)

```bash
/gsdcn-graphify build                 # Build or rebuild the knowledge graph
/gsdcn-graphify query authentication  # Search the graph for a term
/gsdcn-graphify status                # Show freshness and statistics
/gsdcn-graphify diff                  # Show changes since last build
```

**Programmatic access:** `node gsd-tools.cjs graphify <build|query|status|diff|snapshot>` — see [CLI Tools Reference](CLI-TOOLS.md).

---

## AI Integration Commands

### `/gsdcn-ai-integration-phase`

AI framework selection wizard for integrating AI/LLM capabilities into a project phase. Presents an interactive decision matrix, surfaces domain-specific failure modes and eval criteria, and produces `AI-SPEC.md` with a framework recommendation, implementation guidance, and evaluation strategy.

**Produces:** `{phase}-AI-SPEC.md` in the phase directory

**Spawns:** 3 parallel specialist agents: domain-researcher, framework-selector, ai-researcher, and eval-planner

```bash
/gsdcn-ai-integration-phase              # Wizard for the current phase
/gsdcn-ai-integration-phase 3           # Wizard for a specific phase
```

---

### `/gsdcn-eval-review`

Retroactive audit of an implemented AI phase's evaluation coverage. Checks implementation against the `AI-SPEC.md` evaluation plan produced by `/gsdcn-ai-integration-phase`. Scores each eval dimension as COVERED/PARTIAL/MISSING.

**Prerequisites:** Phase has been executed and has an `AI-SPEC.md`
**Produces:** `{phase}-EVAL-REVIEW.md` with findings, gaps, and remediation guidance

```bash
/gsdcn-eval-review                       # Audit current phase
/gsdcn-eval-review 3                     # Audit a specific phase
```

---

## Update Commands

### `/gsdcn-update`

Update GSD with changelog preview.

```bash
/gsdcn-update                         # Check for updates and install
```

### `/gsdcn-reapply-patches`

Restore local modifications after a GSD update.

```bash
/gsdcn-reapply-patches                # Merge back local changes
```

---

## Code Quality Commands

### `/gsdcn-code-review`

Review source files changed during a phase for bugs, security vulnerabilities, and code quality problems.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | **Yes** | Phase number whose changes to review (e.g., `2` or `02`) |
| `--depth=quick\|standard\|deep` | No | Review depth level (overrides `workflow.code_review_depth` config). `quick`: pattern-matching only (~2 min). `standard`: per-file analysis with language-specific checks (~5–15 min, default). `deep`: cross-file analysis including import graphs and call chains (~15–30 min) |
| `--files file1,file2,...` | No | Explicit comma-separated file list; skips SUMMARY/git scoping entirely |

**Prerequisites:** Phase has been executed and has SUMMARY.md or git history
**Produces:** `{phase}-REVIEW.md` in phase directory with severity-classified findings
**Spawns:** `gsd-code-reviewer` agent

```bash
/gsdcn-code-review 3                          # Standard review for phase 3
/gsdcn-code-review 2 --depth=deep             # Deep cross-file review
/gsdcn-code-review 4 --files src/auth.ts,src/token.ts  # Explicit file list
```

---

### `/gsdcn-code-review-fix`

Auto-fix issues found by `/gsdcn-code-review`. Reads `REVIEW.md`, spawns a fixer agent, commits each fix atomically, and produces a `REVIEW-FIX.md` summary.

| Argument | Required | Description |
|----------|----------|-------------|
| `N` | **Yes** | Phase number whose REVIEW.md to fix |
| `--all` | No | Include Info findings in fix scope (default: Critical + Warning only) |
| `--auto` | No | Enable fix + re-review iteration loop, capped at 3 iterations |

**Prerequisites:** Phase has a `{phase}-REVIEW.md` file (run `/gsdcn-code-review` first)
**Produces:** `{phase}-REVIEW-FIX.md` with applied fixes summary
**Spawns:** `gsd-code-fixer` agent

```bash
/gsdcn-code-review-fix 3                      # Fix Critical + Warning findings for phase 3
/gsdcn-code-review-fix 3 --all               # Include Info findings
/gsdcn-code-review-fix 3 --auto              # Fix and re-review until clean (max 3 iterations)
```

---

### `/gsdcn-audit-fix`

Autonomous audit-to-fix pipeline — runs an audit, classifies findings, fixes auto-fixable issues with test verification, and commits each fix atomically.

| Flag | Description |
|------|-------------|
| `--source <audit>` | Which audit to run (default: `audit-uat`) |
| `--severity high\|medium\|all` | Minimum severity to process (default: `medium`) |
| `--max N` | Maximum findings to fix (default: 5) |
| `--dry-run` | Classify findings without fixing (shows classification table) |

**Prerequisites:** At least one phase has been executed with UAT or verification
**Produces:** Fix commits with test verification; classification report

```bash
/gsdcn-audit-fix                              # Run audit-uat, fix medium+ issues (max 5)
/gsdcn-audit-fix --severity high             # Only fix high-severity issues
/gsdcn-audit-fix --dry-run                   # Preview classification without fixing
/gsdcn-audit-fix --max 10 --severity all     # Fix up to 10 issues of any severity
```

---

## Fast & Inline Commands

### `/gsdcn-fast`

Execute a trivial task inline — no subagents, no planning overhead. For typo fixes, config changes, small refactors, forgotten commits.

| Argument | Required | Description |
|----------|----------|-------------|
| `task description` | No | What to do (prompted if omitted) |

**Not a replacement for `/gsdcn-quick`** — use `/gsdcn-quick` for anything needing research, multi-step planning, or verification.

```bash
/gsdcn-fast "fix typo in README"
/gsdcn-fast "add .env to gitignore"
```

---

### `/gsdcn-review`

Cross-AI peer review of phase plans from external AI CLIs.

| Argument | Required | Description |
|----------|----------|-------------|
| `--phase N` | **Yes** | Phase number to review |

| Flag | Description |
|------|-------------|
| `--gemini` | Include Gemini CLI review |
| `--claude` | Include Claude CLI review (separate session) |
| `--codex` | Include Codex CLI review |
| `--coderabbit` | Include CodeRabbit review |
| `--opencode` | Include OpenCode review (via GitHub Copilot) |
| `--qwen` | Include Qwen Code review (Alibaba Qwen models) |
| `--cursor` | Include Cursor agent review |
| `--all` | Include all available CLIs |

**Produces:** `{phase}-REVIEWS.md` — consumable by `/gsdcn-plan-phase --reviews`

```bash
/gsdcn-review --phase 3 --all
/gsdcn-review --phase 2 --gemini
```

---

### `/gsdcn-pr-branch`

Create a clean PR branch by filtering out `.planning/` commits.

| Argument | Required | Description |
|----------|----------|-------------|
| `target branch` | No | Base branch (default: `main`) |

**Purpose:** Reviewers see only code changes, not GSD planning artifacts.

```bash
/gsdcn-pr-branch                     # Filter against main
/gsdcn-pr-branch develop             # Filter against develop
```

---

### `/gsdcn-audit-uat`

Cross-phase audit of all outstanding UAT and verification items.

**Prerequisites:** At least one phase has been executed with UAT or verification
**Produces:** Categorized audit report with human test plan

```bash
/gsdcn-audit-uat
```

---

### `/gsdcn-secure-phase`

Retroactively verify threat mitigations for a completed phase.

| Argument | Required | Description |
|----------|----------|-------------|
| `phase number` | No | Phase to audit (default: last completed phase) |

**Prerequisites:** Phase must have been executed. Works with or without existing SECURITY.md.
**Produces:** `{phase}-SECURITY.md` with threat verification results
**Spawns:** `gsd-security-auditor` agent

Three operating modes:
1. SECURITY.md exists — audit and verify existing mitigations
2. No SECURITY.md but PLAN.md has threat model — generate from artifacts
3. Phase not executed — exits with guidance

```bash
/gsdcn-secure-phase                   # Audit last completed phase
/gsdcn-secure-phase 5                 # Audit specific phase
```

---

### `/gsdcn-docs-update`

Generate or update project documentation verified against the codebase.

| Argument | Required | Description |
|----------|----------|-------------|
| `--force` | No | Skip preservation prompts, regenerate all docs |
| `--verify-only` | No | Check existing docs for accuracy, no generation |

**Produces:** Up to 9 documentation files (README, architecture, API, getting started, development, testing, configuration, deployment, contributing)
**Spawns:** `gsd-doc-writer` agents (one per doc type), then `gsd-doc-verifier` agents for factual verification

Each doc writer explores the codebase directly — no hallucinated paths or stale signatures. Doc verifier checks claims against the live filesystem.

```bash
/gsdcn-docs-update                    # Generate/update docs interactively
/gsdcn-docs-update --force            # Regenerate all docs
/gsdcn-docs-update --verify-only      # Verify existing docs only
```

---

## Backlog & Thread Commands

### `/gsdcn-add-backlog`

Add an idea to the backlog parking lot using 999.x numbering.

| Argument | Required | Description |
|----------|----------|-------------|
| `description` | **Yes** | Backlog item description |

**999.x numbering** keeps backlog items outside the active phase sequence. Phase directories are created immediately so `/gsdcn-discuss-phase` and `/gsdcn-plan-phase` work on them.

```bash
/gsdcn-add-backlog "GraphQL API layer"
/gsdcn-add-backlog "Mobile responsive redesign"
```

---

### `/gsdcn-review-backlog`

Review and promote backlog items to active milestone.

**Actions per item:** Promote (move to active sequence), Keep (leave in backlog), Remove (delete).

```bash
/gsdcn-review-backlog
```

---

### `/gsdcn-plant-seed`

Capture a forward-looking idea with trigger conditions — surfaces automatically at the right milestone.

| Argument | Required | Description |
|----------|----------|-------------|
| `idea summary` | No | Seed description (prompted if omitted) |

Seeds solve context rot: instead of a one-liner in Deferred that nobody reads, a seed preserves the full WHY, WHEN to surface, and breadcrumbs to details.

**Produces:** `.planning/seeds/SEED-NNN-slug.md`
**Consumed by:** `/gsdcn-new-milestone` (scans seeds and presents matches)

```bash
/gsdcn-plant-seed "Add real-time collaboration when WebSocket infra is in place"
```

---

### `/gsdcn-thread`

Manage persistent context threads for cross-session work.

| Argument | Required | Description |
|----------|----------|-------------|
| (none) / `list` | — | List all threads |
| `list --open` | — | List threads with status `open` or `in_progress` only |
| `list --resolved` | — | List threads with status `resolved` only |
| `status <slug>` | — | Show status of a specific thread |
| `close <slug>` | — | Mark a thread as resolved |
| `name` | — | Resume existing thread by name |
| `description` | — | Create new thread |

Threads are lightweight cross-session knowledge stores for work that spans multiple sessions but doesn't belong to any specific phase. Lighter weight than `/gsdcn-pause-work`.

```bash
/gsdcn-thread                         # List all threads
/gsdcn-thread list --open             # List only open/in-progress threads
/gsdcn-thread list --resolved         # List only resolved threads
/gsdcn-thread status fix-deploy-key   # Show thread status
/gsdcn-thread close fix-deploy-key    # Mark thread as resolved
/gsdcn-thread fix-deploy-key-auth     # Resume thread
/gsdcn-thread "Investigate TCP timeout in pasta service"  # Create new
```

---

## State Management Commands

### `state validate`

Detect drift between STATE.md and the actual filesystem.

**Prerequisites:** `.planning/STATE.md` exists
**Produces:** Validation report showing any drift between STATE.md fields and filesystem reality

```bash
node gsd-tools.cjs state validate
```

---

### `state sync [--verify]`

Reconstruct STATE.md from actual project state on disk.

| Flag | Description |
|------|-------------|
| `--verify` | Dry-run mode — show proposed changes without writing |

**Prerequisites:** `.planning/` directory exists
**Produces:** Updated `STATE.md` reflecting filesystem reality

```bash
node gsd-tools.cjs state sync             # Reconstruct STATE.md from disk
node gsd-tools.cjs state sync --verify    # Dry-run: show changes without writing
```

---

### `state planned-phase`

Record state transition after plan-phase completes (Planned/Ready to execute).

| Flag | Description |
|------|-------------|
| `--phase N` | Phase number that was planned |
| `--plans N` | Number of plans generated |

**Prerequisites:** Phase has been planned
**Produces:** Updated `STATE.md` with post-planning state

```bash
node gsd-tools.cjs state planned-phase --phase 3 --plans 2
```

---

## Community Commands

### Community Hooks

Optional git and session hooks gated behind `hooks.community: true` in `.planning/config.json`. All are no-ops unless explicitly enabled.

| Hook | Purpose |
|------|---------|
| `gsd-validate-commit.sh` | Enforce Conventional Commits format on git commit messages |
| `gsd-session-state.sh` | Track session state transitions |
| `gsd-phase-boundary.sh` | Enforce phase boundary checks |

Enable with:
```json
{ "hooks": { "community": true } }
```

---

### `/gsdcn-join-discord`

Open Discord community invite.

```bash
/gsdcn-join-discord
```
