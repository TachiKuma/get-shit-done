'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS = [
  'discuss-phase.md',
  'plan-phase.md',
  'execute-phase.md',
  'progress.md',
];

function readWorkflow(name) {
  return fs.readFileSync(path.join(ROOT, 'get-shit-done', 'workflows', name), 'utf8');
}

describe('runtime locale propagation coverage', () => {
  test('priority workflows mention response_language propagation', () => {
    for (const workflowName of WORKFLOWS) {
      const content = readWorkflow(workflowName);
      assert.ok(
        content.includes('response_language'),
        `${workflowName} should mention response_language`
      );
    }
  });

  test('priority workflows describe canonical locale contract and English retention', () => {
    for (const workflowName of WORKFLOWS) {
      const content = readWorkflow(workflowName);
      assert.ok(
        content.includes('canonical locale'),
        `${workflowName} should mention canonical locale`
      );
      assert.ok(
        content.includes('English'),
        `${workflowName} should mention English retention`
      );
    }
  });

  test('progress workflow keeps locale guidance visible in report output', () => {
    const progressWorkflow = readWorkflow('progress.md');
    assert.ok(progressWorkflow.includes('**Response language:**'));
  });

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
});
