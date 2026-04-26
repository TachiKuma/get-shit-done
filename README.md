<div align="center">

# GSD-CN 中文发行版

**基于 [get-shit-done](https://github.com/gsd-build/get-shit-done) 的非官方简体中文发行版**

一个轻量且强大的元提示、上下文工程与规格驱动开发系统，适用于 Claude Code、OpenCode、Gemini CLI、Kilo、Codex、Copilot、Cursor、Windsurf 等 AI 编程助手。

**解决上下文腐烂问题——即 AI 在填满上下文窗口后质量逐渐下降的问题。**

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx gsdcn@latest
```

`gsdcn` npm 入口会显式激活 GSD-CN 品牌安装路径，生成 `gsdcn-*` 命令前缀、`gsdcn-file-manifest.json` 与 `.planning-gsdcn/` 状态目录。

**支持 Mac、Windows 和 Linux。**

<br>

![GSD Install](assets/terminal.svg)

<br>

*"如果你清楚地知道自己想要什么，这个工具真的能帮你做到。没有废话。"*

*"我试过 SpecKit、OpenSpec 和 Taskmaster——这个工具给我带来了最好的结果。"*

*"这是我在 Claude Code 上最强大的扩展。没有过度设计，就是把事情做完。"*

<br>

**被 Amazon、Google、Shopify 和 Webflow 的工程师所信赖。**

[为什么构建它](#why-i-built-this) · [工作原理](#how-it-works) · [命令列表](#commands) · [为什么有效](#why-it-works) · [用户指南](docs/USER-GUIDE.md) · [操作演示](docs/USER-GUIDE.md#end-to-end-walkthrough)

</div>

---

> [!IMPORTANT]
> ## 关于 GSD-CN
>
> **GSD-CN 是 `get-shit-done` 的非官方简体中文发行版。**
>
> - **上游来源：** 本项目基于 [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) 维护
> - **兼容关系：** 功能行为与上游保持一致；仅在显示文案、注释、默认语言与命令前缀（`gsdcn-*`）层面存在差异
> - **非官方声明：** 本项目不是官方 GSD 的组成部分，不受上游团队维护；中文发行版独立维护
> - **当前阶段：** 第一阶段只承诺 `zh-CN` 简体中文发行版落地；其他语言支持（`ja-JP`、`ko-KR`、`pt-BR` 等）全部推迟至后续阶段

---

## 为什么选择 GSD-CN

中文用户可以直接通过 `GSD-CN` 获得默认简体中文体验，同时不牺牲上游行为一致性与官方 GSD 的共存能力：

- **默认中文体验**：安装、帮助、输出文案统一使用简体中文
- **上游行为一致**：除显示层外，所有功能行为与官方 GSD 保持一致
- **同机共存**：官方 `GSD` 与 `GSD-CN` 可同时安装，互不覆盖
- **同工作区切换**：通过 `gsd-*` 与 `gsdcn-*` 显式双命令区分，无歧义

---

## 与官方 GSD 的区别

| 维度 | 官方 GSD | GSD-CN |
|------|----------|---------|
| 命令前缀 | `gsd-*` / `$gsd-*` | `gsdcn-*` / `$gsdcn-*` |
| 默认显示语言 | 英语 | 简体中文（`zh-CN`） |
| 状态目录 | `.planning/` | `.planning-gsdcn/` |
| 安装名称空间 | `gsd-file-manifest.json` | `gsdcn-file-manifest.json` |
| 功能行为 | 原版 | 与上游完全一致（无行为分叉） |
| 其他语言支持 | 多语言 | 当前仅 `zh-CN`（其他语言推迟） |

---

## 快速开始

```bash
npx gsdcn@latest
```

Windows PowerShell：

```powershell
npx gsdcn@latest
```

安装器会提示选择：
1. **运行环境**：Claude Code、OpenCode、Gemini CLI、Kilo、Codex、Copilot、Cursor、Windsurf 等
2. **安装位置**：全局（所有项目）或本地（当前项目）

安装完成后，使用 `gsdcn-*` 前缀命令验证：
- Claude Code / Gemini / Copilot：`/gsdcn-help`
- Codex：`$gsdcn-help`

> [!NOTE]
> 若需要在同一台机器上同时使用官方 GSD 与 GSD-CN，两套安装互不覆盖，命令、技能（skills）、配置与缓存均完全隔离。官方 GSD 默认安装路径仍是 `npx get-shit-done-cc@latest`；GSD-CN 使用 `npx gsdcn@latest` 显式进入中文发行版品牌。

---


## 最新功能亮点（v1.38.x）

> 基于上游 [get-shit-done v1.38.5](https://github.com/gsd-build/get-shit-done/blob/main/CHANGELOG.md)

### 新增命令

| 命令 | 说明 |
|------|------|
| `/gsdcn-ingest-docs` | 从混合 ADR/PRD/SPEC/DOC 文档一键初始化或合并 `.planning-gsdcn/` 规划结构，并行分类、合并冲突检测 |
| `/gsdcn-plan-review-convergence` | 跨 AI 计划收敛循环——自动化 plan → review → replan 周期，直到无 HIGH 级别问题 |
| `/gsdcn-spec-phase` | Socratic 规格细化：在讨论阶段前锁定可伪证需求，输出 SPEC.md |
| `/gsdcn-spike` / `/gsdcn-sketch` | 快速可行性验证（spike）与 UI 设计草图（sketch），结果保存至 `.planning-gsdcn/` |
| `/gsdcn-spike-wrap-up` / `/gsdcn-sketch-wrap-up` | 将 spike/sketch 发现打包为项目本地 skills |
| `/gsdcn-progress --forensic` | 标准进度报告后附加 6 项完整性审计 |

### SDK 与执行修复

- **SDK 预构建发布**：不再需要从源码编译，安装更可靠，彻底解决 `gsd-sdk: command not found` 问题
- **SDK executor 修复**：SUMMARY.md 现正确写入 `.planning-gsdcn/phases/{phase}/`，而非项目根目录
- **executor_model `"inherit"` 修复**：执行时不再错误传递 `model="inherit"` 给 Task，正确继承 orchestrator 模型
- **SDK 使用完整 agent 提示**：解决 SDK 使用精简副本（仅 17% 内容）导致行为偏差的问题
- **验证状态读取修复**：verify session 现读取 VERIFICATION.md 的真实状态，而非仅依赖 exit code

### 工具链改进

- **Shell hooks 过期检测修复**：`gsd-phase-boundary.sh` 等 hooks 不再在每次会话误报为"过期"（#2136）
- **架构文档增强**：`/gsdcn-map-codebase` 现输出含 ASCII 系统图、数据流追踪与约束列表的完整架构文档
- **`/gsd-settings-advanced`**：新增六区块高级配置命令，涵盖计划弹跳、超时、分支模板、跨 AI 委托与上下文窗口
- **`context_window` 配置项**：支持设置 `1000000` 启用 1M 上下文模型，并自动开启自适应上下文增强

---

## 工作流程

### 1. 初始化项目

```
/gsdcn-new-project
```

一条命令，一个流程：

1. **提问**：深度理解项目目标、约束与技术偏好
2. **研究**：并行 agents 调查领域知识（可选）
3. **需求**：提炼 v1/v2 范围与阶段路线图
4. **路线图**：创建映射到需求的阶段规划

你审批路线图后即可开始构建。

**产物：** `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`、`.planning-gsdcn/research/`

---

### 2. 讨论阶段

```
/gsdcn-discuss-phase 1
```

**这是你塑造实现方式的地方。**

系统分析阶段并识别灰色地带，逐一确认你的偏好。输出 `CONTEXT.md`，直接驱动研究与规划。

**产物：** `{phase_num}-CONTEXT.md`

---

### 3. 规划阶段

```
/gsdcn-plan-phase 1
```

系统：

1. **研究**：调查如何实现本阶段，以 CONTEXT.md 决策为指导
2. **规划**：创建 2-3 个原子任务计划，使用 XML 结构
3. **校验**：对照需求检查计划，循环直至通过

**产物：** `{phase_num}-RESEARCH.md`、`{phase_num}-{N}-PLAN.md`

---

### 4. 执行阶段

```
/gsdcn-execute-phase 1
```

系统：

1. **并行执行计划**：Wave 机制下可并行，依赖则串行
2. **每个计划独立上下文**：200k token 全用于实现，零历史垃圾
3. **每个任务独立提交**：清晰 git 历史
4. **对照目标校验**：确认代码库交付了阶段承诺

**产物：** `{phase_num}-{N}-SUMMARY.md`、`{phase_num}-VERIFICATION.md`

---

### 5. 验证工作

```
/gsdcn-verify-work 1
```

系统：

1. **提取可测试交付物**：你现在应该能做什么
2. **逐一引导验证**：是/否或描述问题
3. **自动诊断失败**：派生调试 agent 定位根因
4. **创建修复计划**：准备立即重新执行

**产物：** `{phase_num}-UAT.md`，如有问题则生成修复计划

---

### 6. 循环 → 发布 → 完成 → 下一里程碑

```
/gsdcn-discuss-phase 2
/gsdcn-plan-phase 2
/gsdcn-execute-phase 2
/gsdcn-verify-work 2
/gsdcn-ship 2
...
/gsdcn-complete-milestone
/gsdcn-new-milestone
```

或者让 GSD-CN 自动判断下一步：

```
/gsdcn-next
```

---

## 命令

### 核心工作流

| 命令 | 功能说明 |
|------|----------|
| `/gsdcn-new-project [--auto]` | 完整初始化：提问 → 研究 → 需求 → 路线图 |
| `/gsdcn-discuss-phase [N] [--auto] [--analyze] [--chain]` | 规划前捕获实现决策 |
| `/gsdcn-plan-phase [N] [--auto]` | 研究 + 规划 + 校验一个阶段 |
| `/gsdcn-execute-phase <N>` | 并行 wave 执行所有计划，完成后校验 |
| `/gsdcn-verify-work [N]` | 人工验收测试，自动诊断 |
| `/gsdcn-ship [N] [--draft]` | 从已验证的阶段工作创建 PR |
| `/gsdcn-next` | 自动检测并执行下一步 |
| `/gsdcn-complete-milestone` | 归档里程碑，打标签 |
| `/gsdcn-new-milestone [name]` | 开始下一版本 |

### 导航

| 命令 | 功能说明 |
|------|----------|
| `/gsdcn-progress` | 当前位置？下一步是什么？ |
| `/gsdcn-help` | 显示所有命令与使用指南 |
| `/gsdcn-update` | 更新 GSD-CN（显示变更预览） |

### 工具

| 命令 | 功能说明 |
|------|----------|
| `/gsdcn-settings` | 配置模型档位与工作流 agents |
| `/gsdcn-quick [--full]` | 使用 GSD-CN 保证执行临时任务 |
| `/gsdcn-health [--repair]` | 校验 `.planning-gsdcn/` 目录完整性 |

> **完整命令参考：** [docs/COMMANDS.md](docs/COMMANDS.md)

---

## 配置

GSD-CN 将项目配置存储在 `.planning-gsdcn/config.json` 中。在 `/gsdcn-new-project` 时创建，通过 `/gsdcn-settings` 更新。

### 核心设置

| 设置项 | 选项 | 默认值 | 功能说明 |
|--------|------|--------|----------|
| `mode` | `yolo`、`interactive` | `interactive` | 自动审批 vs 每步确认 |
| `granularity` | `coarse`、`standard`、`fine` | `standard` | 阶段粒度 |
| `response_language` | 字符串 | `zh-CN` | AI 响应语言 |

> **完整配置参考：** [docs/CONFIGURATION.md](docs/CONFIGURATION.md)

---

## 与官方 GSD 共存

GSD-CN 设计为可与官方 GSD 同机共存：

- **命令隔离**：`gsd-*` 与 `gsdcn-*` 前缀互不干扰
- **文件隔离**：官方 `gsd-file-manifest.json` 与 `gsdcn-file-manifest.json` 独立
- **缓存隔离**：`~/.cache/gsd/` 与 `~/.cache/gsdcn/` 独立
- **状态目录隔离**：`.planning/` 与 `.planning-gsdcn/` 独立
- **技能隔离**：`skills/gsd-*` 与 `skills/gsdcn-*` 独立

同一工作区中，直接通过命令前缀区分调用：

- 官方 GSD：使用 `gsd` 系列命令（以 `gsd-` 为前缀的 skill/tool）
- GSD-CN：使用 `/gsdcn-help`、`/gsdcn-progress` 等 `gsdcn` 前缀命令

---

## 未来语言支持（Deferred）

> [!NOTE]
> **当前里程碑（第一阶段）只承诺 `zh-CN` 简体中文发行版。**
>
> 以下语言支持已列入后续路线图，但不在当前交付范围内：
> - `ja-JP` 日语发行版
> - `ko-KR` 韩语发行版
> - `pt-BR` 葡萄牙语（巴西）发行版
> - 其他语言发行版
>
> 如需使用其他语言，请使用官方 [get-shit-done](https://github.com/gsd-build/get-shit-done)。

---

## 安全说明

GSD-CN 继承上游所有安全加固能力：

- **路径遍历防护**：所有用户提供的文件路径都在项目目录内校验
- **提示注入检测**：对用户提供文本进行集中扫描
- **安全 JSON 解析**：格式错误的参数会被捕获

> **安全文件保护：** 将含密钥的文件添加到 Claude Code 的 deny 列表，防止被读取。

---

## 开发安装

如需从源码本地安装以测试修改或贡献代码：

<details>
<summary><strong>从源码安装（开发者）</strong></summary>

克隆仓库、构建 hooks，然后运行本地安装器：

```bash
git clone https://github.com/TachiKuma/get-shit-done.git
cd get-shit-done
npm run build:hooks
node bin/gsdcn.js --claude --local --gsdcn
```

**`build:hooks` 步骤是必须的** — 它将 hook 源码编译到 `hooks/dist/`，安装器从此目录复制文件。跳过此步骤将导致 hooks 未安装，Claude Code 中会出现 hook 错误。（npm 发布版通过 `prepublishOnly` 自动处理此步骤。）

安装到 `./.claude/`（本地安装），适合在提交前测试修改。

如需同时构建 SDK：

```bash
npm run build:sdk
node bin/install.js --claude --local --gsdcn
```

</details>

---

## 故障排除

> **GSD 新手？** 查看用户指南中的[端到端操作演示](docs/USER-GUIDE.md#end-to-end-walkthrough) — 包含从 `/gsd-new-project` 到 `/gsd-verify-work` 的完整示例项目输出。

> **已有代码？** 先运行 `/gsd-map-codebase`。它会并行分析你的技术栈、架构、约定和问题。之后 `/gsd-new-project` 就能理解你的代码库——问题会聚焦于你要添加的内容，规划时会自动加载你的代码模式。

**安装后找不到命令？**
- 重启你的运行环境以重新加载命令/技能
- 验证文件是否存在于 `~/.claude/skills/gsdcn-*/SKILL.md`（全局安装）

**命令不按预期工作？**
- 运行 `/gsdcn-help` 验证安装
- 重新运行 `npx gsdcn@latest` 重新安装

**更新到最新版本：**
```bash
npx gsdcn@latest
```

---

## 卸载

```bash
# 全局卸载
npx gsdcn --claude --global --uninstall
npx gsdcn --codex --global --uninstall

# 本地卸载（当前项目）
npx gsdcn --claude --local --uninstall
```

这将移除所有 GSD-CN 命令、agents、hooks 与设置，同时保留你的其他配置。

---

## 上游项目

本项目基于以下上游仓库：

- **上游：** [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
- **许可证：** MIT License

GSD-CN 是非官方发行版，目标是在不牺牲上游行为一致性的前提下，为中文用户提供更好的默认体验。

---

## 许可证

MIT License。详见 [LICENSE](LICENSE)。

---

<div align="center">

**Claude Code 很强大。GSD-CN 让它更可靠、更适合中文用户。**

</div>

