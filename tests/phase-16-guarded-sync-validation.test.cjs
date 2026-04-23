'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const PHASE_DIR = path.join(ROOT, '.planning', 'phases', '16-upstream-sync-protected');

const SNAPSHOT_PATH = path.join(PHASE_DIR, '16-WIP-SNAPSHOT.md');
const CHECKLIST_PATH = path.join(PHASE_DIR, '16-PROTECTION-CHECKLIST.md');
const PLAYBOOK_PATH = path.join(PHASE_DIR, '16-SYNC-PLAYBOOK.md');
const INTEGRATION_REPORT_PATH = path.join(PHASE_DIR, '16-INTEGRATION-SYNC-REPORT.md');
const POST_SYNC_REPORT_PATH = path.join(PHASE_DIR, '16-POST-SYNC-REPORT.md');
const SUMMARY_PATH = path.join(PHASE_DIR, '16-03-SUMMARY.md');
const VERIFICATION_PATH = path.join(PHASE_DIR, '16-VERIFICATION.md');

const REQUIRED_ARTIFACTS = [
  SNAPSHOT_PATH,
  CHECKLIST_PATH,
  PLAYBOOK_PATH,
  INTEGRATION_REPORT_PATH,
  POST_SYNC_REPORT_PATH,
  SUMMARY_PATH,
  VERIFICATION_PATH,
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseSnapshotEntries(snapshotContent) {
  const entries = new Map();
  const regex = /^sha256:\s+([a-f0-9]{64})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(snapshotContent)) !== null) {
    entries.set(match[2].trim(), match[1]);
  }

  return entries;
}

function runGit(args) {
  return execSync(`git ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

describe('phase 16 guarded sync validation artifacts', () => {
  const snapshotContent = readUtf8(SNAPSHOT_PATH);
  const checklistContent = readUtf8(CHECKLIST_PATH);
  const playbookContent = readUtf8(PLAYBOOK_PATH);
  const integrationReportContent = readUtf8(INTEGRATION_REPORT_PATH);
  const postSyncReportContent = readUtf8(POST_SYNC_REPORT_PATH);
  const summaryContent = readUtf8(SUMMARY_PATH);
  const verificationContent = readUtf8(VERIFICATION_PATH);
  const snapshotEntries = parseSnapshotEntries(snapshotContent);

  test('all required Phase 16 validation artifacts exist', () => {
    for (const artifactPath of REQUIRED_ARTIFACTS) {
      assert.ok(fs.existsSync(artifactPath), `required artifact missing: ${path.relative(ROOT, artifactPath)}`);
    }
  });

  test('WIP snapshot captures exactly 11 protected-file baselines', () => {
    assert.strictEqual(snapshotEntries.size, 11, 'Phase 16 snapshot must record 11 machine-readable SHA baselines');

    const expectedGroups = [
      'get-shit-done/locales/zh-CN/assets.json',
      'get-shit-done/references/localization-governance-surfaces.json',
      'tests/claude-install-output-localization.test.cjs',
    ];

    for (const relativePath of expectedGroups) {
      assert.ok(snapshotEntries.has(relativePath), `snapshot missing protected path: ${relativePath}`);
    }
  });

  test('snapshot baselines remain internally consistent with Phase 16 post-sync evidence', () => {
    for (const [relativePath, expectedSha] of snapshotEntries.entries()) {
      assert.ok(
        postSyncReportContent.includes(expectedSha),
        `post-sync report must preserve snapshot SHA for ${relativePath}`
      );
      assert.ok(
        checklistContent.includes(expectedSha) || checklistContent.includes(expectedSha.slice(0, 8)),
        `checklist must carry forward the snapshot baseline for ${relativePath}`
      );
    }
  });

  test('protection checklist records protected-file green path and explicit deferred warnings', () => {
    assert.ok(
      checklistContent.includes('5/5 PROTECTED OK') || checklistContent.includes('5 个文件） | [x] 全绿'),
      'checklist must summarize zh-CN protected files as green'
    );
    assert.ok(
      checklistContent.includes('tests/ 回归测试（5 个文件） | [x] 全绿'),
      'checklist must summarize protected test files as green'
    );
    assert.ok(
      checklistContent.includes('blocker_failures=13') && checklistContent.includes('T-16-15 accept'),
      'checklist must preserve the intentional governance defer rationale'
    );
  });

  test('integration sync report documents detached worktree merge and replay handoff', () => {
    assert.ok(
      integrationReportContent.includes('detached HEAD') &&
      integrationReportContent.includes('backup file count: 11'),
      'integration report must document detached worktree setup and 11 protected backups'
    );
    assert.ok(
      integrationReportContent.includes('merge commit: a78eeda8c850847d6341387c5c3a62edbb9e6a62'),
      'integration report must record the integration merge commit'
    );
    assert.ok(
      integrationReportContent.includes('conflicts encountered: 18 files') &&
      integrationReportContent.includes('zh-CN/ : 无冲突') &&
      integrationReportContent.includes('tests/ : 无冲突'),
      'integration report must prove protected surfaces stayed out of merge conflicts'
    );
    assert.ok(
      integrationReportContent.includes('status: READY_FOR_REPLAY'),
      'integration report must hand off to replay with READY_FOR_REPLAY status'
    );
  });

  test('post-sync report preserves protected-file evidence and partial-pass routing', () => {
    assert.ok(
      postSyncReportContent.includes('main HEAD（sync 后）：** 0991995a7e1329742b072b817497f6da7274db99') &&
      postSyncReportContent.includes('upstream/main HEAD：** d1b56febcb5cf6ed7e0226efffc11c5aa6205d54'),
      'post-sync report must pin the main and upstream commit evidence'
    );

    for (const expectedSha of snapshotEntries.values()) {
      assert.ok(
        postSyncReportContent.includes(expectedSha),
        `post-sync report must echo snapshot baseline SHA ${expectedSha}`
      );
    }

    assert.ok(
      postSyncReportContent.includes('PARTIAL PASS') &&
      postSyncReportContent.includes('T-16-15 accept') &&
      postSyncReportContent.includes('移交 Phase 17'),
      'post-sync report must document the accepted defer path into Phase 17'
    );
  });

  test('verification report marks guarded sync complete while deferring blocker drift to Phase 17', () => {
    assert.ok(
      verificationContent.includes('SC-1 | integration worktree') &&
      verificationContent.includes('SC-4 | `get-shit-done/references/localization-governance-surfaces.json`'),
      'verification report must keep guarded-sync truths SC-1..SC-4'
    );
    assert.ok(
      verificationContent.includes('SC-5 | `node scripts/verify-localization-governance.cjs` 输出 `blocker_failures=0`') &&
      verificationContent.includes('DEFERRED → Phase 17'),
      'verification report must explicitly defer SC-5 to Phase 17'
    );
    assert.ok(
      verificationContent.includes('无 gaps。'),
      'verification report must conclude there are no remaining Phase 16 gaps'
    );
  });

  test('summary keeps the human-approved handoff and protected-file acceptance rationale', () => {
    assert.ok(
      summaryContent.includes('approved by human: "approved — 移交 Phase 17"'),
      'summary must preserve the blocking human checkpoint approval'
    );
    assert.ok(
      summaryContent.includes('受保护文件 SHA 核查 11/11 PROTECTED OK') &&
      summaryContent.includes('governance/test 契约漂移（blocker_failures=13，46 failed）由 T-16-15 accept 处置'),
      'summary must retain both the protected green path and accepted drift disposition'
    );
  });

  test('git history still contains the recorded guarded-sync merge topology', { skip: !fs.existsSync(path.join(ROOT, '.git')) }, () => {
    const mainParents = runGit('rev-list --parents -n 1 0991995a7e1329742b072b817497f6da7274db99').split(/\s+/);
    const integrationParents = runGit('rev-list --parents -n 1 a78eeda8c850847d6341387c5c3a62edbb9e6a62').split(/\s+/);

    assert.strictEqual(mainParents.length, 3, 'Phase 16 main sync commit must remain a 2-parent merge');
    assert.strictEqual(integrationParents.length, 3, 'integration worktree merge commit must remain a 2-parent merge');
    assert.strictEqual(
      mainParents[2],
      'a78eeda8c850847d6341387c5c3a62edbb9e6a62',
      'main guarded-sync commit must merge the recorded integration worktree head'
    );
    assert.strictEqual(
      integrationParents[2],
      'd1b56febcb5cf6ed7e0226efffc11c5aa6205d54',
      'integration merge commit must retain the recorded upstream/main parent'
    );
  });

  test('sync playbook still carries the guarded conflict policy', () => {
    assert.ok(
      playbookContent.includes('接受 current（ours）版本') &&
      playbookContent.includes('接受 upstream（theirs）版本'),
      'sync playbook must preserve the explicit conflict strategy table'
    );
    assert.ok(
      playbookContent.includes('integration worktree') && playbookContent.includes('WIP replay'),
      'sync playbook must preserve the guarded sync sequence'
    );
  });
});
