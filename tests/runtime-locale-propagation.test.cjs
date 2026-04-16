'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

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
});

