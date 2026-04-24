'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const INSTALL_PATH = path.join(__dirname, '..', 'bin', 'install.js');

function readInstallSource() {
  return fs.readFileSync(INSTALL_PATH, 'utf8');
}

describe('GSD-CN runtime/Cline surface contract', () => {
  test('Cline .clinerules generation uses brand-aware command prefix and planning root', () => {
    const source = readInstallSource();
    assert.match(source, /const commandPrefix = INSTALLER_BRAND\.cmdPrefix/);
    assert.match(source, /const planningRootName = INSTALLER_BRAND\.brandId === 'gsdcn' \? '\.planning-gsdcn' : '\.planning'/);
    assert.match(source, /user runs.*commandPrefix.*command\./s);
    assert.match(source, /Planning artifacts live.*planningRootName/s);
  });

  test('finishInstall next command uses installer brand prefix for GSD-CN-capable runtimes', () => {
    const source = readInstallSource();
    assert.match(source, /const commandPrefix = INSTALLER_BRAND\.cmdPrefix/);
    assert.match(source, /`\/\$\{commandPrefix\}-new-project`/);
    assert.match(source, /`\$\$\{commandPrefix\}-new-project`/);
  });

  test('GSD-CN README install surface does not present ambiguous first install command', () => {
    const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
    const firstInstall = readme.match(/npx get-shit-done-cc@latest[^\n]*/);
    assert.ok(firstInstall, 'README must contain an install command');
    assert.ok(firstInstall[0].includes('--gsdcn'), `first install command must include --gsdcn, got: ${firstInstall[0]}`);
  });
});
