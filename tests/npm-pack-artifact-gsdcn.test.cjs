'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
function runNpm(args) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm', ...args] : args;
  return execFileSync(command, commandArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runPackDryRun() {
  const output = runNpm(['pack', '--dry-run', '--json']);
  const result = JSON.parse(output.replace(/^\uFEFF/, ''));
  assert.ok(Array.isArray(result), 'npm pack --json must return an array');
  assert.ok(result[0], 'npm pack result must include package metadata');
  return result[0];
}

function fileSet(packResult) {
  return new Set(packResult.files.map(file => file.path.replace(/\\/g, '/')));
}

describe('GSD-CN npm pack dry-run artifact contract', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const packResult = runPackDryRun();
  const files = fileSet(packResult);

  test('pack metadata matches GSD-CN package identity', () => {
    assert.strictEqual(packResult.name, 'gsdcn');
    assert.strictEqual(packResult.version, pkg.version);
    assert.deepStrictEqual(pkg.bin, { gsdcn: 'bin/gsdcn.js' });
  });

  test('pack artifact contains GSD-CN runtime-critical files', () => {
    for (const requiredPath of [
      'package.json',
      'README.md',
      'LICENSE',
      'bin/install.js',
      'bin/gsdcn.js',
      'commands/gsd/new-project.md',
      'agents/gsd-executor.md',
      'hooks/gsd-session-state.sh',
      'hooks/gsd-statusline.js',
      'get-shit-done/bin/lib/locale.cjs',
      'get-shit-done/locales/en/installer.json',
      'get-shit-done/locales/zh-CN/installer.json',
      'sdk/package.json',
      'sdk/prompts/workflows/plan-phase.md',
      'sdk/src/index.ts',
    ]) {
      assert.ok(files.has(requiredPath), `${requiredPath} must be included in npm pack artifact`);
    }
  });

  test('pack artifact excludes repo-only and transient content', () => {
    const forbiddenMatchers = [
      /^\.planning\//,
      /^tests\//,
      /^node_modules\//,
      /^\.git\//,
      /\.tgz$/,
      /(^|\/)gsd-local-patches(\/|$)/,
      /(^|\/)gsdcn-local-patches(\/|$)/,
      /(^|\/)gsd-pristine(\/|$)/,
      /(^|\/)gsdcn-pristine(\/|$)/,
      /^sdk\/src\/.*\.test\.ts$/,
    ];
    for (const packedPath of files) {
      for (const forbidden of forbiddenMatchers) {
        assert.doesNotMatch(packedPath, forbidden, `${packedPath} must not be packed`);
      }
    }
  });
});
