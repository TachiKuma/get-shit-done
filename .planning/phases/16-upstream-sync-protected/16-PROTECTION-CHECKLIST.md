# Phase 16 保护核查清单

每个 checkpoint 在 WIP replay（Plan 03 Task 2）后由执行者手动核查并打勾。

**基线来源：** `.planning/phases/16-upstream-sync-protected/16-WIP-SNAPSHOT.md`（Task 1 产出）

---

## 前置状态（replay 前准备）

- [ ] 已读取 16-WIP-SNAPSHOT.md 中各文件 SHA-256 基线
- [ ] /tmp/gsd16-protected-wip/ 临时备份目录已创建（或 Windows 下 C:/Temp/gsd16-protected-wip）
- [ ] 受保护文件已备份到临时目录（参见 16-SYNC-PLAYBOOK.md 步骤 2）

---

## zh-CN Catalog（D-03：保留本地，不被上游覆盖）

**预期基线 SHA-256（来自 WIP 快照）：**

| 文件 | 预期 SHA-256 |
|------|-------------|
| get-shit-done/locales/zh-CN/assets.json | `17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988` |
| get-shit-done/locales/zh-CN/claude-skills.json | `794b0edd72569ad630ded1bf2b7f4a91506931711d1c500a6b4d6357ff78c524` |
| get-shit-done/locales/zh-CN/codex-skills.json | `3f97764fc76cbdd2d57aff4d0c80c0820c814aacc850835c9534d6771139bce5` |
| get-shit-done/locales/zh-CN/installer.json | `a4ce7872f3b9c4b533cd03d5b3bd57a2677029b2be108c0af9395726c486cfb0` |
| get-shit-done/locales/zh-CN/runtime.json | `5e4a74a4241c1895fea9b23f7f87201844d853788aada694dd3682b51a61a05f` |

**核查命令：**
```bash
sha256sum get-shit-done/locales/zh-CN/assets.json
sha256sum get-shit-done/locales/zh-CN/claude-skills.json
sha256sum get-shit-done/locales/zh-CN/codex-skills.json
sha256sum get-shit-done/locales/zh-CN/installer.json
sha256sum get-shit-done/locales/zh-CN/runtime.json
```

**核查结果：**

- [ ] get-shit-done/locales/zh-CN/assets.json SHA-256 与快照一致
- [ ] get-shit-done/locales/zh-CN/claude-skills.json SHA-256 与快照一致
- [ ] get-shit-done/locales/zh-CN/codex-skills.json SHA-256 与快照一致
- [ ] get-shit-done/locales/zh-CN/installer.json SHA-256 与快照一致
- [ ] get-shit-done/locales/zh-CN/runtime.json SHA-256 与快照一致

---

## en/ Catalog（D-02：全量接受上游）

**核查命令：**
```bash
git diff upstream/main -- get-shit-done/locales/en/
```
预期：无输出（无差异）。如有输出则表示 en/ 未完整接受上游变更，需排查。

- [ ] get-shit-done/locales/en/*.json 内容与 upstream/main 一致（git diff 无输出）

---

## governance-surfaces.json（保留本地，不被上游覆盖）

**预期基线 SHA-256：** `a9a1259d21f03c6faee01a6902b6b4a7f9a270fadd3fe225821c35ff54afd229`

**核查命令：**
```bash
sha256sum get-shit-done/references/localization-governance-surfaces.json
```

- [ ] get-shit-done/references/localization-governance-surfaces.json SHA-256 与快照一致

---

## tests/ 本地化回归测试（保留本地，不被上游覆盖）

**预期基线 SHA-256（来自 WIP 快照）：**

| 文件 | 预期 SHA-256 |
|------|-------------|
| tests/claude-skill-display-localization.test.cjs | `c67cbe5942ca3f0f1be62f8dd9fba61e2ca63108e267f8ae7e6db83a20de5120` |
| tests/claude-install-output-localization.test.cjs | `c138fafe311237daa8114d6a9eb1f1ad018800ef4584f9472496582e30b91033` |
| tests/claude-install-output-fallback-boundary.test.cjs | `4ed740c56b5a3c341714c2ae85610f9f344c96d7291d1a058dc348dcd22cd882` |
| tests/claude-installer-locale-contract.test.cjs | `bb881e5a4ee4dea19bebe877fe0854c4ad4c1a335eed2023b76e47691a111fa4` |
| tests/claude-skill-display-catalog.test.cjs | `d199a8503c9a72c11928388c16dc61aaf2d0aa4d23d62735f09e29dd271a9aa9` |

**核查命令：**
```bash
sha256sum tests/claude-skill-display-localization.test.cjs
sha256sum tests/claude-install-output-localization.test.cjs
sha256sum tests/claude-install-output-fallback-boundary.test.cjs
sha256sum tests/claude-installer-locale-contract.test.cjs
sha256sum tests/claude-skill-display-catalog.test.cjs
```

**核查结果：**

- [ ] tests/claude-skill-display-localization.test.cjs SHA-256 与快照一致
- [ ] tests/claude-install-output-localization.test.cjs SHA-256 与快照一致
- [ ] tests/claude-install-output-fallback-boundary.test.cjs SHA-256 与快照一致
- [ ] tests/claude-installer-locale-contract.test.cjs SHA-256 与快照一致
- [ ] tests/claude-skill-display-catalog.test.cjs SHA-256 与快照一致

---

## 验收测试

**核查命令：**
```bash
node scripts/verify-localization-governance.cjs
npm test 2>&1 | tail -10
```

- [ ] node scripts/verify-localization-governance.cjs 输出 blocker_failures=0
- [ ] node scripts/verify-localization-governance.cjs 输出 warning_failures=0
- [ ] npm test 结果 >= 72 passed, 0 failed

---

## 核查状态汇总

填写完毕后在此处记录：

| 分类 | 状态 | 备注 |
|------|------|------|
| zh-CN catalog（5 个文件） | [ ] 全绿 / [ ] 失败 | |
| en/ catalog | [ ] 全绿 / [ ] 失败 | |
| governance-surfaces.json | [ ] 全绿 / [ ] 失败 | |
| tests/ 回归测试（5 个文件） | [ ] 全绿 / [ ] 失败 | |
| governance verifier | [ ] 全绿 / [ ] 失败 | |
| npm test | [ ] 全绿 / [ ] 失败 | |
