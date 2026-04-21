# Phase 17: Sync 后本地化文件审计与 blocker suite 重验证 - Pattern Map

**Mapped:** 2026-04-21
**Files analyzed:** 13 (9 test files + 4 catalog/doc files)
**Analogs found:** 13 / 13

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tests/runtime-locale-propagation.test.cjs` | test | request-response | `tests/template-asset-localization.test.cjs` | exact |
| `tests/template-asset-localization.test.cjs` | test | request-response | `tests/runtime-locale-propagation.test.cjs` | exact |
| `tests/response-language-docs.test.cjs` | test | request-response | `tests/runtime-locale-propagation.test.cjs` | role-match |
| `tests/claude-install-output-localization.test.cjs` | test | file-I/O + CRUD | `tests/install-uninstall-output-localization.test.cjs` | exact |
| `tests/claude-install-output-fallback-boundary.test.cjs` | test | file-I/O + CRUD | `tests/claude-install-output-localization.test.cjs` | exact |
| `tests/claude-installer-locale-contract.test.cjs` | test | request-response | `tests/codex-installer-locale-contract.test.cjs` | exact |
| `tests/claude-skill-display-catalog.test.cjs` | test | CRUD | `tests/codex-skill-display-catalog.test.cjs` | exact |
| `tests/codex-install-output-localization.test.cjs` | test | file-I/O + CRUD | `tests/claude-install-output-localization.test.cjs` | exact |
| `tests/codex-installer-locale-contract.test.cjs` | test | request-response | `tests/claude-installer-locale-contract.test.cjs` | exact |
| `get-shit-done/locales/en/*.json` | config | CRUD | `get-shit-done/locales/zh-CN/*.json` | exact |
| `get-shit-done/locales/zh-CN/*.json` | config | CRUD | `get-shit-done/locales/en/*.json` | exact |
| `docs/INVENTORY.md` | config | CRUD | `tests/inventory-counts.test.cjs` (驱动文件) | role-match |
| `docs/INVENTORY-MANIFEST.json` | config | CRUD | `tests/inventory-manifest-sync.test.cjs` (驱动文件) | role-match |

---

## Pattern Assignments

### `tests/runtime-locale-propagation.test.cjs` (test, request-response)

**Analog:** `tests/template-asset-localization.test.cjs`

**Import pattern** (lines 1-11):
```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');
```

**Core pattern — workflow 文件内容验证** (lines 20-67):
```javascript
// 用 fs.readFileSync 读取 workflow 文件，再用 assert.ok + content.includes 做文本契约断言
function readWorkflow(name) {
  return fs.readFileSync(path.join(ROOT, 'get-shit-done', 'workflows', name), 'utf8');
}

// 示例：同一批文件遍历验证
for (const workflowName of WORKFLOWS) {
  const content = readWorkflow(workflowName);
  assert.ok(content.includes('response_language'), `${workflowName} should mention response_language`);
}
```

**Governance manifest 验证模式** (lines 54-67):
```javascript
test('priority workflows are tracked as blocker surfaces in governance', () => {
  const manifest = loadGovernanceManifest();
  const workflowGroup = getSurfaceGroup(manifest, 'priority-workflows');
  assert.ok(workflowGroup, 'priority-workflows group should exist');
  assert.equal(workflowGroup.disposition, 'blocker');
  for (const workflowName of WORKFLOWS) {
    assert.ok(
      workflowGroup.surfaces.some(surface => surface.path.endsWith(`/${workflowName}`)),
      `${workflowName} should be a blocker workflow surface`
    );
  }
});
```

**修复关注点：** 如果 workflow 文件（discuss-phase.md、plan-phase.md 等）的内容被上游 sync 改变，需核对：
- `content.includes('response_language')` — 检查关键字是否仍存在
- `content.includes('canonical locale')` — 检查 canonical locale 契约是否仍存在
- `content.includes('**Response language:**')` — progress.md 的具体格式

---

### `tests/template-asset-localization.test.cjs` (test, request-response)

**Analog:** `tests/runtime-locale-propagation.test.cjs`

**Import pattern** (lines 1-12):
```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadLocaleCatalog } = require('../get-shit-done/bin/lib/locale.cjs');
const {
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');
```

**核心模式 — assets catalog key 对等验证** (lines 19-31):
```javascript
test('en and zh-CN assets catalogs keep identical key sets for first-batch templates', () => {
  const en = JSON.parse(read('get-shit-done/locales/en/assets.json'));
  const zh = JSON.parse(read('get-shit-done/locales/zh-CN/assets.json'));
  const enKeys = Object.keys(en).sort();
  const zhKeys = Object.keys(zh).sort();
  assert.deepStrictEqual(zhKeys, enKeys, 'assets locale catalogs should not drift');
  for (const prefix of ['assets.summary', 'assets.verification', 'assets.uat', 'assets.validation']) {
    assert.ok(enKeys.some(key => key.startsWith(prefix)), `missing ${prefix} keys`);
  }
});
```

**修复关注点：** 上游新增模板文件时，需检查：
- `get-shit-done/templates/` 或 `get-shit-done/workflows/` 文件列表是否发生变化
- 文件中是否仍包含 `assets`、`fixed-string`、`response_language`、`English` 四个关键字
- governance manifest 中 asset-catalogs 组是否仍存在

---

### `tests/response-language-docs.test.cjs` (test, request-response)

**Analog:** `tests/runtime-locale-propagation.test.cjs`

**核心模式 — 文档内容契约验证** (lines 30-67):
```javascript
const CONFIG_DOC = path.join(ROOT, 'docs', 'CONFIGURATION.md');
const PLANNING_CONFIG_DOC = path.join(ROOT, 'get-shit-done', 'references', 'planning-config.md');

describe('response_language documentation contract', () => {
  test('both docs recommend canonical locale examples', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);
      assert.ok(content.includes('BCP 47'), `...`);
      assert.ok(content.includes('"en"'), `...`);
      assert.ok(content.includes('"zh-CN"'), `...`);
    }
  });
```

**修复关注点：** `docs/CONFIGURATION.md` 和 `get-shit-done/references/planning-config.md` 如果被上游 sync 更新，需检查：
- 是否仍包含 `BCP 47`、`"en"`、`"zh-CN"` 示例
- 是否仍包含 `alias` 兼容性描述、`zh-CN -> en` fallback 说明
- 是否仍包含 `installer`、`codex-skills`、`three separate localization chain` 等字段
- 是否仍列出所有 6 个 first-batch skills (`gsd-new-milestone` 等)

---

### `tests/claude-install-output-localization.test.cjs` (test, file-I/O + CRUD)

**Analog:** `tests/install-uninstall-output-localization.test.cjs`

**Import + 环境变量设定 pattern** (lines 1-13):
```javascript
'use strict';

const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';
const { install } = require('../bin/install.js');

const EN_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'claude-skills.json');
const ZH_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'claude-skills.json');
```

**临时目录管理 pattern** (lines 24-85):
```javascript
const tempRoots = [];

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-install-'));
  tempRoots.push(projectDir);
  return projectDir;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});
```

**catalog 读取 + install 运行 pattern** (lines 40-56):
```javascript
function runGlobalClaudeInstall(projectDir, configDir) {
  const previousCwd = process.cwd();
  const previousConfigDir = process.env.CLAUDE_CONFIG_DIR;
  try {
    process.chdir(projectDir);
    process.env.CLAUDE_CONFIG_DIR = configDir;
    return install(true, 'claude');
  } finally {
    process.chdir(previousCwd);
    if (previousConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = previousConfigDir;
    }
  }
}
```

**hardcoded 期望值 — 关键修复目标** (lines 199, 211):
```javascript
// 如果 zh-CN catalog 值发生变化，需要同步更新这些 hardcoded 期望：
assert.equal(extractDescription(content), '创建详细阶段计划（PLAN.md），并完成执行前验证闭环');
assert.equal(extractShortDescription(content), '创建阶段计划并完成执行前验证');

// English skill body 的 hardcoded 期望 — 上游 bin/install.js 重构后可能变化：
assert.ok(
  planPhaseContent.includes(
    'Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.'
  ),
  'skill body should remain English canonical'
);
```

**partial fallback mock 模式** (lines 110-129):
```javascript
function withMockedCatalogRead(overrides, callback) {
  const originalReadFileSync = fs.readFileSync;
  const normalizedOverrides = new Map(
    Object.entries(overrides).map(([catalogPath, contents]) => [path.resolve(catalogPath), contents])
  );
  fs.readFileSync = function mockedReadFileSync(filePath, options) {
    const resolvedPath = path.resolve(String(filePath));
    if (normalizedOverrides.has(resolvedPath)) return normalizedOverrides.get(resolvedPath);
    return originalReadFileSync.call(this, filePath, options);
  };
  try {
    return callback();
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
}
```

---

### `tests/claude-install-output-fallback-boundary.test.cjs` (test, file-I/O + CRUD)

**Analog:** `tests/claude-install-output-localization.test.cjs`（同模式，不同断言场景）

**核心差异 — NON_PROMISED_SAMPLE 边界验证** (lines 15-18, 88-104):
```javascript
const NON_PROMISED_SAMPLE = [
  'gsd-ingest-docs',
  'gsd-plan-review-convergence',
];

function assertEnglishFallbackPair(configDir, englishCatalog) {
  for (const skill of NON_PROMISED_SAMPLE) {
    const frontmatter = extractFrontmatter(content);
    // 关键：zh-CN 安装时，非 first-batch skill 的 frontmatter 不得含中文字符
    assert.doesNotMatch(frontmatter, /[\u4e00-\u9fff]/, `${skill} frontmatter should stay English-only`);
  }
}
```

**修复关注点：** 如果 `NON_PROMISED_SAMPLE` 中的 skill 被上游添加到 zh-CN catalog，测试会失败。反之，如果上游重构后这些 skill 不再存在于 commands/gsd/ 目录，安装步骤会报错。需在审计时确认这两个 skill 仍在 commands/gsd/ 中且未进入 zh-CN catalog。

---

### `tests/claude-installer-locale-contract.test.cjs` (test, request-response)

**Analog:** `tests/codex-installer-locale-contract.test.cjs`

**关键函数导入 pattern** (lines 10-13):
```javascript
process.env.GSD_TEST_MODE = '1';
const {
  convertClaudeCommandToClaudeSkill,
  resolveInstallerLocale,
} = require('../bin/install.js');
```

**hardcoded 期望值 — 关键修复目标** (lines 55-71):
```javascript
test('real zh-CN catalog localizes Claude frontmatter while preserving body and non-display fields', () => {
  const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', { locale: 'zh-CN' });
  assert.equal(extractDescription(output), '创建详细阶段计划（PLAN.md），并完成执行前验证闭环');
  assert.equal(extractShortDescription(output), '创建阶段计划并完成执行前验证');
  // 以下字段应原样保留（测试 English canonical 留存）
  assert.ok(output.includes('argument-hint: "[phase number]"'));
  assert.ok(output.includes('agent: gsd-planner'));
  assert.ok(output.includes('<objective>'));
  assert.ok(output.includes('Create executable phase prompts (PLAN.md files).'));
});
```

**catalogResolver 注入 pattern**（partial fallback 测试）(lines 88-116):
```javascript
const resolver = (namespace, locale, key) => {
  if (namespace !== 'claude-skills') return null;
  if (locale === 'zh-CN' && key.endsWith('.description')) {
    return { value: '仅有中文 description', sourceLocale: 'zh-CN' };
  }
  // ... en fallback
  return null;
};
const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
  locale: 'zh-CN',
  catalogResolver: resolver,
});
```

**修复关注点：** 如果上游重构了 `convertClaudeCommandToClaudeSkill` 的函数签名（例如新增必填参数，或重命名为其他函数），这些 `require('../bin/install.js')` 的导入路径和函数名需要同步更新。`resolveInstallerLocale` 函数是否仍被 export 也需确认。

---

### `tests/claude-skill-display-catalog.test.cjs` (test, CRUD)

**Analog:** `tests/codex-skill-display-catalog.test.cjs`（对称结构）

**catalog 枚举验证 pattern** (lines 59-75):
```javascript
describe('claude skill display catalog contract', () => {
  test('English claude-skills catalog covers the current command inventory exactly', () => {
    const catalog = readCatalog(EN_CATALOG_PATH);
    const expectedSkills = expectedEnglishSkills();   // 来自 commands/gsd/ 目录遍历
    assert.deepStrictEqual(extractSkillIds(catalog), expectedSkills);
  });

  test('English claude-skills catalog provides exactly one display pair per skill', () => {
    const catalog = readCatalog(EN_CATALOG_PATH);
    const expectedKeys = expectedEnglishSkills().flatMap((skill) => [
      `claude-skills.${skill}.description`,
      `claude-skills.${skill}.short-description`,
    ]).sort();
    assert.deepStrictEqual(Object.keys(catalog).sort(), expectedKeys);
  });
```

**key 格式约束验证 pattern** (lines 77-89):
```javascript
for (const catalog of [englishCatalog, chineseCatalog]) {
  for (const key of Object.keys(catalog)) {
    assert.match(key, /^claude-skills\.gsd-[a-z0-9_-]+\.(description|short-description)$/);
    for (const fragment of FORBIDDEN_KEY_FRAGMENTS) {
      assert.equal(key.includes(fragment), false, `${key} should not include ${fragment}`);
    }
  }
}
```

**修复关注点：** 上游新增了 commands/gsd/ 目录下的命令文件时，en/claude-skills.json 中需要同步添加对应的 `.description` 和 `.short-description` 键。这是此测试失败的最常见根本原因。

---

### `tests/codex-install-output-localization.test.cjs` (test, file-I/O + CRUD)

**Analog:** `tests/claude-install-output-localization.test.cjs`（对称结构，local install 路径不同）

**关键差异 — local Codex install 运行 pattern** (lines 40-48):
```javascript
function runLocalCodexInstall(projectDir) {
  const previousCwd = process.cwd();
  try {
    process.chdir(projectDir);
    return install(false, 'codex');   // false = local, 'codex' = runtime
  } finally {
    process.chdir(previousCwd);
  }
}
```

**stdout 捕获 pattern** (lines 51-80):
```javascript
function captureInstallOutput(callback) {
  const stdout = [];
  const originalStdoutWrite = process.stdout.write;
  process.stdout.write = function captureStdout(chunk, encoding, cb) {
    stdout.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };
  try { callback(); } finally { process.stdout.write = originalStdoutWrite; }
  return { stdout: stdout.join(''), stderr: stderr.join('') };
}
```

**Codex skill 路径差异** (lines 82-87):
```javascript
function readInstalledSkill(projectDir, skill) {
  // Codex 安装到项目本地 .codex/skills/，而非全局 configDir
  return fs.readFileSync(
    path.join(projectDir, '.codex', 'skills', skill, 'SKILL.md'), 'utf8'
  );
}
```

**zh-CN 安装输出语言验证 pattern** (lines 158-165):
```javascript
test('local Codex install does not emit the misleading unreplaced .claude warning', () => {
  // 验证 zh-CN 安装时 stdout 输出正确语言
  assert.match(output.stdout, /正在为/);
  assert.match(output.stdout, /已生成 config\.toml/);
  assert.equal(/unreplaced \.claude path reference/i.test(output.stderr), false, '...');
});
```

**修复关注点：** 如果上游重构 `bin/install.js` 后，zh-CN installer 输出的进度文本发生变化（例如"正在为"改为其他措辞），需更新这里的 `assert.match` 期望。

---

### `tests/codex-installer-locale-contract.test.cjs` (test, request-response)

**Analog:** `tests/claude-installer-locale-contract.test.cjs`（对称结构）

**关键函数导入 pattern** (lines 10-14):
```javascript
process.env.GSD_TEST_MODE = '1';
const INSTALL_MODULE_PATH = require.resolve('../bin/install.js');
const {
  convertClaudeCommandToCodexSkill,
  resolveInstallerLocale,
} = require('../bin/install.js');
```

**模块安静加载验证 pattern** (lines 52-61):
```javascript
test('importing the installer module in GSD_TEST_MODE stays quiet', () => {
  const output = captureStdout(() => {
    delete require.cache[INSTALL_MODULE_PATH];
    require(INSTALL_MODULE_PATH);
    delete require.cache[INSTALL_MODULE_PATH];
  });
  assert.equal(stripAnsi(output).trim(), '');
});
```

**hardcoded 期望值 — Codex 格式差异** (lines 76-98):
```javascript
// Codex 格式：short-description 在 frontmatter 中直接出现（非 metadata: 嵌套）
assert.ok(output.includes('short-description: "创建阶段计划并完成执行前验证"'));
// Codex 独有：adapter block
assert.ok(output.includes('<codex_skill_adapter>'));
assert.ok(output.includes('## A. Skill Invocation'));
```

---

## Locale Catalog 修改模式

### `get-shit-done/locales/en/*.json` (config, CRUD)

**现有结构** — 5 个 catalog 文件，每个文件一个 JSON 对象：
- `claude-skills.json` — `"claude-skills.{skillId}.description"` 和 `.short-description` 键对
- `codex-skills.json` — `"codex-skills.{skillId}.description"` 和 `.short-description` 键对
- `installer.json` — `"installer.{messageId}"` 键（支持 `{{placeholder}}` 插值）
- `runtime.json` — `"runtime.{category}.{key}"` 键
- `assets.json` — `"assets.{section}.{field}"` 键

**键漂移刷新 pattern**（新增 skill 时）:
```json
// 在 en/claude-skills.json 末尾追加，保持 gsd-* 字母序
{
  "claude-skills.gsd-new-skill.description": "One-line description of what this skill does",
  "claude-skills.gsd-new-skill.short-description": "Short version for display"
}
```

**键命名约束**（由 `claude-skill-display-catalog.test.cjs` 强制执行）:
```
^claude-skills\.gsd-[a-z0-9_-]+\.(description|short-description)$
```
禁止出现以下字段片段：`body`、`flag`、`path`、`tool`、`allowed-tools`、`argument-hint`、`name`

### `get-shit-done/locales/zh-CN/*.json` (config, CRUD)

**受保护文件** — Phase 17 D-02 决策：仅在有明确键漂移依据时才修改，SHA-256 基线在 `16-WIP-SNAPSHOT.md` 固化。

**当前 zh-CN claude-skills.json 内容**（6 个 first-batch skills，共 12 键）:
```json
{
  "claude-skills.gsd-new-milestone.description": "启动新的里程碑周期，更新 PROJECT.md 并进入需求梳理",
  "claude-skills.gsd-new-milestone.short-description": "启动新里程碑并进入需求梳理",
  "claude-skills.gsd-progress.description": "检查项目进度，查看当前上下文，并路由到下一步执行或规划动作",
  "claude-skills.gsd-progress.short-description": "检查进度并路由到下一步",
  "claude-skills.gsd-discuss-phase.description": "在规划前收集阶段上下文，通过提问锁定实现决策与边界",
  "claude-skills.gsd-discuss-phase.short-description": "收集阶段上下文并锁定决策",
  "claude-skills.gsd-plan-phase.description": "创建详细阶段计划（PLAN.md），并完成执行前验证闭环",
  "claude-skills.gsd-plan-phase.short-description": "创建阶段计划并完成执行前验证",
  "claude-skills.gsd-execute-phase.description": "按 wave 执行阶段内全部计划，并生成对应执行结果",
  "claude-skills.gsd-execute-phase.short-description": "按 wave 执行阶段计划",
  "claude-skills.gsd-next.description": "根据当前 GSD 状态自动推进到下一步工作流",
  "claude-skills.gsd-next.short-description": "自动推进到下一步工作流"
}
```

**Pair-level fallback 契约**（CLAUDE.md 强制规则）:
- 任一字段（description 或 short-description）缺失，则整对回退 English canonical
- 禁止 mixed-language frontmatter（zh-CN description + en short-description）
- zh-CN 承诺面严格锁定在 6 个 first-batch Claude skills，同等结构适用于 codex-skills

---

## INVENTORY 修改模式

### `docs/INVENTORY.md` (config, CRUD)

**驱动测试：** `tests/inventory-counts.test.cjs` 验证格式，`tests/inventory-source-parity.test.cjs` 验证内容

**标题行格式约束**（`inventory-counts.test.cjs` lines 32-37）:
```javascript
// 必须匹配此正则，N 为实际文件数
const re = new RegExp(`^##\\s+${label}\\s+\\((\\d+)\\s+shipped\\)`, 'm');
// 例：## Commands (83 shipped)
// 例：## CLI Modules (15 shipped)
```

**六大 family 对应目录**:
```
Agents:      agents/gsd-*.md
Commands:    commands/gsd/*.md
Workflows:   get-shit-done/workflows/*.md
References:  get-shit-done/references/*.md
CLI Modules: get-shit-done/bin/lib/*.cjs
Hooks:       hooks/*.{js,sh}
```

**更新步骤**（新增文件时）:
1. 在对应 family 的 section 末尾添加行
2. 将 section 标题中的 `(N shipped)` 数字加 1
3. 同步更新 `docs/INVENTORY-MANIFEST.json`（见下）

### `docs/INVENTORY-MANIFEST.json` (config, CRUD)

**驱动测试：** `tests/inventory-manifest-sync.test.cjs`

**更新命令**（由测试文件 line 7 提示）:
```bash
node scripts/gen-inventory-manifest.cjs --write
```

**JSON 结构**:
```json
{
  "generated": "YYYY-MM-DD",
  "families": {
    "agents": ["gsd-advisor-researcher", ...],
    "commands": ["/gsd-add-backlog", ...],
    "workflows": ["discuss-phase.md", ...],
    "references": ["planning-config.md", ...],
    "cli_modules": ["locale.cjs", ...],
    "hooks": ["gsd-statusline.js", ...]
  }
}
```

**注意：** `generated` 日期需更新为执行当天日期；family 数组元素需与 `toName` 函数处理结果一致（commands family 有 `/gsd-` 前缀，其他 family 直接用文件名）。

---

## Shared Patterns（跨文件共用）

### 1. governance manifest 查询模式
**来源：** `scripts/lib/localization-governance.cjs` lines 29-48
**适用于：** 所有需要验证 governance 注册状态的测试文件
```javascript
const { getSurfaceGroup, loadGovernanceManifest } = require('../scripts/lib/localization-governance.cjs');

const manifest = loadGovernanceManifest();
const group = getSurfaceGroup(manifest, 'group-name');
assert.ok(group, 'group should exist');
assert.equal(group.disposition, 'blocker');
assert.ok(group.surfaces.some(s => s.path === 'expected/path'));
```

### 2. GSD_TEST_MODE 设定模式
**来源：** 所有 install 测试文件 line 9
**适用于：** 所有调用 `bin/install.js` 的测试
```javascript
process.env.GSD_TEST_MODE = '1';
const { install } = require('../bin/install.js');
```
**注意：** 此行必须在 `require('../bin/install.js')` 之前，否则 install 模块会在 import 时执行安装逻辑并打印输出。

### 3. 临时目录清理模式
**来源：** `tests/claude-install-output-localization.test.cjs` lines 24-25, 131-135
**适用于：** 所有有文件 I/O 的 install 测试
```javascript
const tempRoots = [];

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});
```

### 4. pair-level fallback 断言模式
**来源：** `tests/claude-install-output-localization.test.cjs` lines 232-261
**适用于：** 所有 locale partial data 场景的测试
```javascript
// zh-CN description 存在但 short-description 缺失时，整对应回退 English
assert.equal(
  extractDescription(content),
  englishCatalog['claude-skills.gsd-execute-phase.description']  // English 值
);
assert.equal(output.includes('仅有中文 description'), false);  // 不应出现中文片段
```

### 5. English canonical body 留存断言模式
**来源：** `tests/claude-install-output-localization.test.cjs` lines 147-153
**适用于：** 所有验证 skill body 未被本地化的测试
```javascript
// 即使 frontmatter 写入 zh-CN，skill body 必须保持 English canonical
assert.ok(
  planPhaseContent.includes(
    'Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.'
  ),
  'skill body should remain English canonical'
);
```

---

## No Analog Found

所有目标文件均找到了精确或角色匹配的 analog，无需依赖 RESEARCH.md patterns。

---

## 修复优先级矩阵（供 Plan 01 执行参考）

| 失败类型 | 根本原因 | 修复 target | 修复动作 |
|----------|----------|-------------|----------|
| claude-skill-display-catalog 失败 | 上游新增 commands/gsd/*.md 文件 | `en/claude-skills.json` | 添加新 skill 的键对 |
| codex-skill-display-catalog 失败 | 上游新增 commands/gsd/*.md 文件 | `en/codex-skills.json` | 添加新 skill 的键对 |
| inventory-counts 失败 | 上游新增模块/命令/workflow 文件 | `docs/INVENTORY.md` | 更新标题数字 + 添加行 |
| inventory-manifest-sync 失败 | 上游新增文件未登记 | `docs/INVENTORY-MANIFEST.json` | `node scripts/gen-inventory-manifest.cjs --write` |
| install-output 测试失败 | bin/install.js 重构改变输出格式 | 相关 `.test.cjs` 文件 | 更新 hardcoded 期望字符串 |
| runtime-locale-propagation 失败 | workflow .md 文件内容被上游更新 | `get-shit-done/workflows/*.md` | 按契约补全缺失的关键字段 |
| response-language-docs 失败 | docs 文件内容被上游更新 | `docs/CONFIGURATION.md` 等 | 补全缺失的文档契约条目 |

---

## Metadata

**Analog search scope:**
- `tests/` — install 输出、locale 契约、catalog、governance、inventory 测试
- `get-shit-done/locales/en/` 和 `zh-CN/` — 5 个 catalog 文件
- `scripts/lib/localization-governance.cjs` — governance 查询库
- `docs/INVENTORY.md` 和 `INVENTORY-MANIFEST.json` — inventory 登记文件
- `bin/install.js` — installer 实现（7010 行，针对性读取）

**Files scanned:** 20
**Pattern extraction date:** 2026-04-21
