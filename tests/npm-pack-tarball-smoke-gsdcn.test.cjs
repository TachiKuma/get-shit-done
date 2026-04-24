'use strict';

const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tempDirs = [];

function runNpm(args) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm', ...args] : args;
  return execFileSync(command, commandArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsdcn-pack-smoke-'));
  tempDirs.push(dir);
  return dir;
}

function packToTemp(tempDir) {
  const output = runNpm(['pack', '--json', '--pack-destination', tempDir]);
  const result = JSON.parse(output.replace(/^\uFEFF/, ''));
  assert.ok(Array.isArray(result), 'npm pack --json must return an array');
  assert.ok(result[0], 'npm pack result must include package metadata');
  return result[0];
}

function listTarball(tarballPath) {
  try {
    return execFileSync('tar', ['-tf', tarballPath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).split(/\r?\n/).filter(Boolean);
  } catch {
    return null;
  }
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('GSD-CN npm pack tarball smoke', () => {
  test('creates temp tarball with GSD-CN bin wrapper and package metadata', () => {
    const tempDir = makeTempDir();
    const packResult = packToTemp(tempDir);
    const tarballPath = path.join(tempDir, packResult.filename);
    const packedPaths = new Set(packResult.files.map(file => file.path.replace(/\\/g, '/')));

    assert.strictEqual(packResult.name, 'gsdcn');
    assert.match(packResult.filename, /^gsdcn-\d+\.\d+\.\d+\.tgz$/);
    assert.ok(fs.existsSync(tarballPath), 'npm pack must write tarball to temp directory');
    assert.ok(packedPaths.has('bin/gsdcn.js'), 'pack metadata must include bin/gsdcn.js');
    assert.ok(packedPaths.has('bin/install.js'), 'pack metadata must include bin/install.js');
    assert.ok(!fs.existsSync(path.join(ROOT, packResult.filename)), 'npm pack smoke must not create tarball in repo root');

    const tarEntries = listTarball(tarballPath);
    if (tarEntries) {
      assert.ok(tarEntries.includes('package/package.json'), 'tarball must contain package/package.json');
      assert.ok(tarEntries.includes('package/bin/gsdcn.js'), 'tarball must contain package/bin/gsdcn.js');
      assert.ok(tarEntries.includes('package/bin/install.js'), 'tarball must contain package/bin/install.js');
    }
  });
});
