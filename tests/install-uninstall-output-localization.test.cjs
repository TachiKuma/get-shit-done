'use strict';

const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';

const { install, uninstall } = require('../bin/install.js');
const INSTALLER_PATH = path.join(__dirname, '..', 'bin', 'install.js');

const tempRoots = [];

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-install-l10n-'));
  tempRoots.push(projectDir);
  return projectDir;
}

function writePlanningConfig(projectDir, responseLanguage) {
  const planningDir = path.join(projectDir, '.planning');
  fs.mkdirSync(planningDir, { recursive: true });
  fs.writeFileSync(
    path.join(planningDir, 'config.json'),
    JSON.stringify({ response_language: responseLanguage }, null, 2),
    'utf8'
  );
}

function captureOutput(callback) {
  const stdout = [];
  const stderr = [];
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = function captureStdout(chunk, encoding, cb) {
    stdout.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };

  process.stderr.write = function captureStderr(chunk, encoding, cb) {
    stderr.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };

  try {
    callback();
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }

  return {
    stdout: stdout.join(''),
    stderr: stderr.join(''),
  };
}

function withProjectCwd(projectDir, callback) {
  const previousCwd = process.cwd();
  try {
    process.chdir(projectDir);
    return callback();
  } finally {
    process.chdir(previousCwd);
  }
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('install/uninstall output localization', () => {
  test('local Codex install and uninstall honor zh-CN response_language while preserving technical identifiers', () => {
    const projectDir = createTempProject();
    writePlanningConfig(projectDir, 'zh-CN');

    const installOutput = withProjectCwd(projectDir, () => captureOutput(() => {
      install(false, 'codex');
    }));

    assert.match(installOutput.stdout, /正在为/);
    assert.match(installOutput.stdout, /已向 skills\/ 安装 \d+ 个 skill/);
    assert.match(installOutput.stdout, /已安装 get-shit-done/);
    assert.match(installOutput.stdout, /已生成 config\.toml/);
    assert.match(installOutput.stdout, /get-shit-done/);
    assert.match(installOutput.stdout, /skills\//);
    assert.match(installOutput.stdout, /config\.toml/);

    const uninstallOutput = withProjectCwd(projectDir, () => captureOutput(() => {
      uninstall(false, 'codex');
    }));

    assert.match(uninstallOutput.stdout, /正在从/);
    assert.match(uninstallOutput.stdout, /已移除 \d+ 个 Codex skill/);
    assert.match(uninstallOutput.stdout, /已从 Codex 卸载 GSD/);
    assert.match(uninstallOutput.stdout, /get-shit-done/);
    assert.match(uninstallOutput.stdout, /config\.toml/);
  });

  test('unsupported response_language falls back to English installer strings', () => {
    const projectDir = createTempProject();
    writePlanningConfig(projectDir, 'Martian');

    const output = withProjectCwd(projectDir, () => captureOutput(() => {
      install(false, 'codex');
    }));

    assert.match(output.stdout, /Installing for/);
    assert.match(output.stdout, /Installed \d+ skills to skills\//);
    assert.match(output.stdout, /Generated config\.toml with \d+ agent roles/);
  });

  test('help output honors zh-CN response_language for installer-facing copy', () => {
    const projectDir = createTempProject();
    writePlanningConfig(projectDir, 'zh-CN');

    const result = spawnSync(process.execPath, [INSTALLER_PATH, '--help'], {
      cwd: projectDir,
      encoding: 'utf8',
      env: { ...process.env, GSD_TEST_MODE: '1' },
      timeout: 20000,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /用法：/);
    assert.match(result.stdout, /选项：/);
    assert.match(result.stdout, /全局安装/);
    assert.match(result.stdout, /仅为 Codex 安装/);
    assert.match(result.stdout, /示例：/);
    assert.match(result.stdout, /说明：/);
    assert.match(result.stdout, /--config-dir/);
  });

  test('help output falls back to English for unsupported locales', () => {
    const projectDir = createTempProject();
    writePlanningConfig(projectDir, 'Martian');

    const result = spawnSync(process.execPath, [INSTALLER_PATH, '--help'], {
      cwd: projectDir,
      encoding: 'utf8',
      env: { ...process.env, GSD_TEST_MODE: '1' },
      timeout: 20000,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Usage:/);
    assert.match(result.stdout, /Options:/);
    assert.match(result.stdout, /Install for Codex only/);
    assert.match(result.stdout, /Examples:/);
    assert.match(result.stdout, /Notes:/);
  });
});
