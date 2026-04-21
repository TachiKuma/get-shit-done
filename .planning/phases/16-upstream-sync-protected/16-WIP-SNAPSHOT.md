# Phase 16 WIP 快照

**生成时间：** 2026-04-21T05:47:10Z
**main HEAD：** 7f1f0144e664e4e5bba78ff9b73adba618ced0ef
**upstream/main HEAD：** d1b56febcb5cf6ed7e0226efffc11c5aa6205d54
**divergence：** 68 commits

## zh-CN Catalog 受保护文件快照

| 文件 | 行数 | SHA-256 |
|------|------|---------|
| get-shit-done/locales/zh-CN/assets.json | 36 | 17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988 |
| get-shit-done/locales/zh-CN/claude-skills.json | 14 | 794b0edd72569ad630ded1bf2b7f4a91506931711d1c500a6b4d6357ff78c524 |
| get-shit-done/locales/zh-CN/codex-skills.json | 14 | 3f97764fc76cbdd2d57aff4d0c80c0820c814aacc850835c9534d6771139bce5 |
| get-shit-done/locales/zh-CN/installer.json | 143 | a4ce7872f3b9c4b533cd03d5b3bd57a2677029b2be108c0af9395726c486cfb0 |
| get-shit-done/locales/zh-CN/runtime.json | 15 | 5e4a74a4241c1895fea9b23f7f87201844d853788aada694dd3682b51a61a05f |

## governance-surfaces.json 快照

| 文件 | 行数 | SHA-256 |
|------|------|---------|
| get-shit-done/references/localization-governance-surfaces.json | 308 | a9a1259d21f03c6faee01a6902b6b4a7f9a270fadd3fe225821c35ff54afd229 |

## tests/ 关键本地化回归测试快照

| 文件 | SHA-256 |
|------|---------|
| tests/claude-skill-display-localization.test.cjs | c67cbe5942ca3f0f1be62f8dd9fba61e2ca63108e267f8ae7e6db83a20de5120 |
| tests/claude-install-output-localization.test.cjs | c138fafe311237daa8114d6a9eb1f1ad018800ef4584f9472496582e30b91033 |
| tests/claude-install-output-fallback-boundary.test.cjs | 4ed740c56b5a3c341714c2ae85610f9f344c96d7291d1a058dc348dcd22cd882 |
| tests/claude-installer-locale-contract.test.cjs | bb881e5a4ee4dea19bebe877fe0854c4ad4c1a335eed2023b76e47691a111fa4 |
| tests/claude-skill-display-catalog.test.cjs | d199a8503c9a72c11928388c16dc61aaf2d0aa4d23d62735f09e29dd271a9aa9 |

## en/ Catalog 策略说明

根据 D-02，get-shit-done/locales/en/ 全套文件在 WIP replay 时全量接受上游版本。
en/ 无需快照，replay 后应与 upstream/main 的 en/ 内容一致。

## 校验参考（sha256 机读格式）

以下内容供 Plan 03 replay 后自动对比脚本使用：

```
sha256: 17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988  get-shit-done/locales/zh-CN/assets.json
sha256: 794b0edd72569ad630ded1bf2b7f4a91506931711d1c500a6b4d6357ff78c524  get-shit-done/locales/zh-CN/claude-skills.json
sha256: 3f97764fc76cbdd2d57aff4d0c80c0820c814aacc850835c9534d6771139bce5  get-shit-done/locales/zh-CN/codex-skills.json
sha256: a4ce7872f3b9c4b533cd03d5b3bd57a2677029b2be108c0af9395726c486cfb0  get-shit-done/locales/zh-CN/installer.json
sha256: 5e4a74a4241c1895fea9b23f7f87201844d853788aada694dd3682b51a61a05f  get-shit-done/locales/zh-CN/runtime.json
sha256: a9a1259d21f03c6faee01a6902b6b4a7f9a270fadd3fe225821c35ff54afd229  get-shit-done/references/localization-governance-surfaces.json
sha256: c67cbe5942ca3f0f1be62f8dd9fba61e2ca63108e267f8ae7e6db83a20de5120  tests/claude-skill-display-localization.test.cjs
sha256: c138fafe311237daa8114d6a9eb1f1ad018800ef4584f9472496582e30b91033  tests/claude-install-output-localization.test.cjs
sha256: 4ed740c56b5a3c341714c2ae85610f9f344c96d7291d1a058dc348dcd22cd882  tests/claude-install-output-fallback-boundary.test.cjs
sha256: bb881e5a4ee4dea19bebe877fe0854c4ad4c1a335eed2023b76e47691a111fa4  tests/claude-installer-locale-contract.test.cjs
sha256: d199a8503c9a72c11928388c16dc61aaf2d0aa4d23d62735f09e29dd271a9aa9  tests/claude-skill-display-catalog.test.cjs
```
