# GSD-CN 文档

GSD-CN 的完整文档——基于 `get-shit-done` 的非官方简体中文发行版，面向中文用户提供默认 `zh-CN` 体验。

**关于本文档：** 本文档索引为简体中文版本。其他语言文档请访问官方上游仓库 [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)。

> [!NOTE]
> **语言支持说明：** 当前里程碑（第一阶段）只承诺 `zh-CN` 简体中文。其他语言版本（`ja-JP`、`ko-KR`、`pt-BR` 等）全部推迟至后续阶段，不在当前交付范围内。

## 文档索引

| 文档 | 适用人群 | 说明 |
|------|----------|------|
| [命令参考](COMMANDS.md) | 所有用户 | `gsdcn-*` 命令语法、标志、选项与示例 |
| [配置参考](CONFIGURATION.md) | 所有用户 | 完整配置 schema、工作流开关、模型档位、git 分支策略 |
| [用户指南](USER-GUIDE.md) | 所有用户 | 工作流演示、故障排除与恢复 |
| [架构说明](ARCHITECTURE.md) | 贡献者、进阶用户 | 系统架构、agent 模型、数据流与内部设计 |
| [功能参考](FEATURES.md) | 所有用户 | 已发布功能的叙述与需求说明 |
| [CLI 工具参考](CLI-TOOLS.md) | 贡献者、agent 作者 | `gsd-tools.cjs` 编程 API |
| [Agent 参考](AGENTS.md) | 贡献者、进阶用户 | 主要 agents 的角色卡片 |

## 快速链接

- **快速开始：** [根 README](../README.md) → 安装 → `/gsdcn-new-project`
- **完整工作流演示：** [用户指南](USER-GUIDE.md)
- **所有命令一览：** [命令参考](COMMANDS.md)
- **配置 GSD-CN：** [配置参考](CONFIGURATION.md)
- **系统内部原理：** [架构说明](ARCHITECTURE.md)
- **贡献或扩展：** [CLI 工具参考](CLI-TOOLS.md) + [Agent 参考](AGENTS.md)

## GSD-CN 与官方 GSD 的差异说明

GSD-CN 与官方 GSD 的文档结构同构，仅在以下方面存在差异：

- **命令前缀**：所有用户可见命令使用 `gsdcn-*` 而非 `gsd-*`
- **默认语言**：响应语言默认为 `zh-CN` 简体中文
- **状态目录**：使用 `.planning-gsdcn/` 而非 `.planning/`
- **显示文案**：界面提示与帮助文本使用中文

行为逻辑、工作流步骤、配置结构与功能集合与上游完全一致。
