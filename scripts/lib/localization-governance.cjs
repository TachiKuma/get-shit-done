'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const MANIFEST_PATH = path.join(
  ROOT,
  'get-shit-done',
  'references',
  'localization-governance-surfaces.json'
);

function loadGovernanceManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function getSurfaceGroup(manifest, groupName) {
  return manifest.surface_groups.find(group => group.group === groupName) || null;
}

function flattenSurfaces(manifest) {
  return manifest.surface_groups.flatMap(group =>
    group.surfaces.map(surface => ({
      ...surface,
      group: group.group,
      disposition: group.disposition,
      owner_hint: group.owner_hint,
    }))
  );
}

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function repoPathExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

module.exports = {
  ROOT,
  MANIFEST_PATH,
  flattenSurfaces,
  getSurfaceGroup,
  loadGovernanceManifest,
  readRepoFile,
  repoPathExists,
};
