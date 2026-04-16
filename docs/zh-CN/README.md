# GSD 文档

Get Shit Done（GSD）框架文档索引。英文 [`../README.md`](../README.md) 是 canonical docs index；本页是 `zh-CN` mirror，保持相同入口职责，并显式标注当前覆盖范围与英文回退。

语言版本：[English](../README.md) · [Português (pt-BR)](../pt-BR/README.md) · [日本語](../ja-JP/README.md) · **简体中文** · [한국어](../ko-KR/README.md)

## 文档索引

| 文档 | 状态 | 说明 |
|------|------|------|
| [用户指南](USER-GUIDE.md) | 已同步 | 首批 `zh-CN` 高价值入口，覆盖工作流、排障与恢复 |
| [架构](../ARCHITECTURE.md) | 回退英文 | 系统架构、代理模型、数据流与内部设计 |
| [功能参考](../FEATURES.md) | 回退英文 | 功能与需求的完整说明 |
| [命令参考](../COMMANDS.md) | 回退英文 | 所有命令、参数、示例与行为说明 |
| [配置参考](../CONFIGURATION.md) | 回退英文 | 配置 schema、工作流开关、模型 profile 与 Git 分支策略 |
| [CLI 工具参考](../CLI-TOOLS.md) | 回退英文 | `gsd-tools.cjs` 的程序化接口 |
| [代理参考](../AGENTS.md) | 回退英文 | 专用代理、职责与协作模式 |
| [上下文监控](../context-monitor.md) | 回退英文 | 上下文窗口监控 hook 说明 |
| [讨论模式](../workflow-discuss-mode.md) | 回退英文 | `discuss-phase` 的 assumptions / interview 模式 |
| [手动更新](../manual-update.md) | 回退英文 | 无 npm 或源码安装时的更新路径 |

## 快速链接

- **开始使用：** [根 README](../../README.zh-CN.md) → 安装 → `/gsd-new-project`
- **首批中文闭环：** [用户指南](USER-GUIDE.md)
- **查看全部命令：** [命令参考](../COMMANDS.md)（回退英文）
- **调整配置：** [配置参考](../CONFIGURATION.md)（回退英文）
- **源码安装或无 npm 环境：** [manual-update.md](../manual-update.md)（回退英文）

## Mirror 状态

- 英文 [`../README.md`](../README.md) 是唯一 canonical source，本页不重新定义 docs index 结构。
- `zh-CN` 当前只同步了高价值入口，不承诺与英文目录完全同量。
- 当中文镜像尚未提供对应文档时，入口会明确标记为“回退英文”，而不是假装已同步。
- 后续 locale mirror 应与本页保持相同的章节职责、gap 表达和高价值入口路径。
