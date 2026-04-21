# Phase 16 Sync Playbook

**策略：** clean-base integration worktree + WIP replay 双阶段（CLAUDE.md §上游同步策略已锁定）
**禁止操作：** 在主工作树直接 `git merge upstream/main` 或 `git rebase`
**参考：** Phase 14.1 已验证执行经验（v1.2-ROADMAP.md §Phase 14.1）

---

## 基线信息（来自 16-WIP-SNAPSHOT.md）

| 项目 | 值 |
|------|-----|
| main HEAD（同步前） | `7f1f0144e664e4e5bba78ff9b73adba618ced0ef` |
| upstream/main HEAD（目标） | `d1b56febcb5cf6ed7e0226efffc11c5aa6205d54` |
| divergence | 68 commits |
| 测试基准 | 72 passed / 0 failed |
| governance 基准 | blocker_failures=0, warning_failures=0, deferred=6 |

---

## 阶段一：在 integration worktree 完成 clean upstream sync（Plan 02 执行）

### 步骤 1：创建 integration worktree

```bash
# 在项目根目录执行（E:/GitHub开源项目/TachiKuma/get-shit-done）
# 注意：若 worktree 已存在，先执行：git worktree remove ../gsd-integration-16 --force
git worktree add ../gsd-integration-16 main
cd ../gsd-integration-16
```

验证：
```bash
git log --oneline -3   # 应显示与 main 相同的最新提交
git status             # 应显示 clean working tree
```

### 步骤 2：保存受保护文件到临时备份目录

```bash
# Windows 系统：若 /tmp/ 不可用，改用 C:/Temp/gsd16-protected-wip
mkdir -p /tmp/gsd16-protected-wip/locales/zh-CN
mkdir -p /tmp/gsd16-protected-wip/references
mkdir -p /tmp/gsd16-protected-wip/tests

# 备份 zh-CN catalog（D-03：replay 时保留本地，不被上游覆盖）
cp get-shit-done/locales/zh-CN/assets.json /tmp/gsd16-protected-wip/locales/zh-CN/
cp get-shit-done/locales/zh-CN/claude-skills.json /tmp/gsd16-protected-wip/locales/zh-CN/
cp get-shit-done/locales/zh-CN/codex-skills.json /tmp/gsd16-protected-wip/locales/zh-CN/
cp get-shit-done/locales/zh-CN/installer.json /tmp/gsd16-protected-wip/locales/zh-CN/
cp get-shit-done/locales/zh-CN/runtime.json /tmp/gsd16-protected-wip/locales/zh-CN/

# 备份 governance manifest
cp get-shit-done/references/localization-governance-surfaces.json /tmp/gsd16-protected-wip/references/

# 备份本地化测试文件（Phase 15 产出的关键测试）
cp tests/claude-skill-display-localization.test.cjs /tmp/gsd16-protected-wip/tests/
cp tests/claude-install-output-localization.test.cjs /tmp/gsd16-protected-wip/tests/
cp tests/claude-install-output-fallback-boundary.test.cjs /tmp/gsd16-protected-wip/tests/
cp tests/claude-installer-locale-contract.test.cjs /tmp/gsd16-protected-wip/tests/
cp tests/claude-skill-display-catalog.test.cjs /tmp/gsd16-protected-wip/tests/
```

验证备份完整性：
```bash
sha256sum /tmp/gsd16-protected-wip/locales/zh-CN/assets.json
# 预期: 17a0a9dfe6d4685730a2ddacfca275dd8ab1e690009a6eb52e818493abc4d988
```

### 步骤 3：执行 clean merge（接受全部上游变更）

```bash
# 在 gsd-integration-16 worktree 内执行
git merge upstream/main --no-edit -m "chore(sync): merge upstream/main HEAD (68 commits) — Phase 16 guarded sync"
```

**若出现 merge conflict，按如下策略解决：**

| 冲突文件范围 | 策略 | 命令 |
|------------|------|------|
| `locales/zh-CN/` 冲突 | 接受 current（ours）版本 | `git checkout --ours get-shit-done/locales/zh-CN/` |
| `tests/` 冲突 | 接受 current（ours）版本 | `git checkout --ours tests/` |
| `references/localization-governance-surfaces.json` 冲突 | 接受 current（ours）版本 | `git checkout --ours get-shit-done/references/localization-governance-surfaces.json` |
| `locales/en/` 冲突 | 接受 upstream（theirs）版本 | `git checkout --theirs get-shit-done/locales/en/` |
| 其他文件冲突 | 接受 upstream（theirs）版本 | `git checkout --theirs <file>` |

解决全部冲突后：
```bash
git add -A
git merge --continue
```

### 步骤 4：验证 integration worktree 状态

```bash
# 确认 merge 完成，无未解决冲突
git status

# 确认上游 en/ 已接受（D-02）：预期无输出
git diff upstream/main -- get-shit-done/locales/en/

# 运行基础测试（记录结果，不阻断同步进程）
npm test 2>&1 | tail -10
```

---

## 阶段二：回放受保护 WIP 到主工作树（Plan 03 执行）

> 详见 Plan 03（16-03-PLAN.md）Task 1 / Task 2

### 核心步骤

**步骤 1：从 integration worktree 将 clean merge commit 推送到 main**

```bash
# 在主工作树（E:/GitHub开源项目/TachiKuma/get-shit-done）
# 将 integration worktree 的 merge commit fast-forward 到 main
git merge ../gsd-integration-16 --ff-only
# 若 fast-forward 失败（有本地 planning commit），使用：
# git merge ../gsd-integration-16 --no-edit
```

**步骤 2：恢复受保护文件（WIP replay）**

```bash
# 恢复 zh-CN catalog
cp /tmp/gsd16-protected-wip/locales/zh-CN/assets.json get-shit-done/locales/zh-CN/
cp /tmp/gsd16-protected-wip/locales/zh-CN/claude-skills.json get-shit-done/locales/zh-CN/
cp /tmp/gsd16-protected-wip/locales/zh-CN/codex-skills.json get-shit-done/locales/zh-CN/
cp /tmp/gsd16-protected-wip/locales/zh-CN/installer.json get-shit-done/locales/zh-CN/
cp /tmp/gsd16-protected-wip/locales/zh-CN/runtime.json get-shit-done/locales/zh-CN/

# 恢复 governance manifest
cp /tmp/gsd16-protected-wip/references/localization-governance-surfaces.json get-shit-done/references/

# 恢复本地化测试
cp /tmp/gsd16-protected-wip/tests/claude-skill-display-localization.test.cjs tests/
cp /tmp/gsd16-protected-wip/tests/claude-install-output-localization.test.cjs tests/
cp /tmp/gsd16-protected-wip/tests/claude-install-output-fallback-boundary.test.cjs tests/
cp /tmp/gsd16-protected-wip/tests/claude-installer-locale-contract.test.cjs tests/
cp /tmp/gsd16-protected-wip/tests/claude-skill-display-catalog.test.cjs tests/
```

**步骤 3：执行 16-PROTECTION-CHECKLIST.md 逐项核查**

```bash
# 核查所有受保护文件 SHA-256 与快照一致
sha256sum get-shit-done/locales/zh-CN/assets.json
# 对比 16-WIP-SNAPSHOT.md 中的基线值
```

**步骤 4：运行验收脚本**

```bash
node scripts/verify-localization-governance.cjs
# 预期: blocker_failures=0, warning_failures=0, deferred=6

npm test
# 预期: >= 72 passed, 0 failed
```

**步骤 5：提交 WIP replay 结果**

```bash
git add get-shit-done/locales/zh-CN/ get-shit-done/references/localization-governance-surfaces.json tests/
git commit -m "chore(16-03): replay protected WIP — restore zh-CN catalog, governance manifest, locale tests"
```

---

## 阶段三：清理 integration worktree

```bash
# 在主工作树根目录执行
git worktree remove ../gsd-integration-16
```

---

## 注意事项

1. **禁止**在主工作树（`E:/GitHub开源项目/TachiKuma/get-shit-done`）直接执行 `git merge upstream/main`
2. **禁止**使用 `git clean -fd` 或 `git restore .` 等批量重置命令
3. 若 worktree 创建失败（路径已存在），先执行 `git worktree remove ../gsd-integration-16 --force` 再重试
4. **Windows 路径**：若 `/tmp/` 不可用，使用 `$TEMP` 或 `C:/Temp/gsd16-protected-wip` 替代
5. 若 merge 过程中 zh-CN/ 或 tests/ 文件被上游覆盖，**不要 panic**——步骤 2 的备份 cp 会恢复它们
6. 所有 conflict 解决完毕后，在 replay 前必须完整核查 16-PROTECTION-CHECKLIST.md 中的全部 "zh-CN Catalog" 条目
