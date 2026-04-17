'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_ENV_KEY = 'GSD_LOCALIZATION_GOVERNANCE_ROOT';
const MANIFEST_ENV_KEY = 'GSD_LOCALIZATION_GOVERNANCE_MANIFEST';

function resolveRepoRoot(rootOverride = process.env[ROOT_ENV_KEY]) {
  return path.resolve(rootOverride || path.join(__dirname, '..', '..'));
}

function resolveManifestPath(
  root = resolveRepoRoot(),
  manifestOverride = process.env[MANIFEST_ENV_KEY]
) {
  if (manifestOverride) {
    return path.isAbsolute(manifestOverride)
      ? manifestOverride
      : path.resolve(root, manifestOverride);
  }

  return path.join(root, 'get-shit-done', 'references', 'localization-governance-surfaces.json');
}

const ROOT = resolveRepoRoot();
const MANIFEST_PATH = resolveManifestPath(ROOT);

function loadGovernanceManifest(options = {}) {
  const root = resolveRepoRoot(options.root);
  const manifestPath = resolveManifestPath(root, options.manifestPath);
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
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

function isTestEntry(entry) {
  return /\.test\.cjs$/i.test(entry);
}

function collectVerificationEntries(manifest) {
  const collected = new Map();

  for (const surface of flattenSurfaces(manifest)) {
    const entry = surface.verification_entry;
    if (!entry || entry === 'report-only') {
      continue;
    }

    if (!collected.has(entry)) {
      collected.set(entry, {
        entry,
        runner: isTestEntry(entry) ? 'test' : 'node',
        surfaces: [],
      });
    }

    collected.get(entry).surfaces.push({
      id: surface.id,
      path: surface.path || null,
      path_pattern: surface.path_pattern || null,
      group: surface.group,
      disposition: surface.disposition,
      owner_hint: surface.owner_hint || null,
      expected_check: surface.expected_check || null,
    });
  }

  return Array.from(collected.values());
}

function readRepoFile(relativePath, root = ROOT) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function repoPathExists(relativePath, root = ROOT) {
  return fs.existsSync(path.join(root, relativePath));
}

module.exports = {
  MANIFEST_ENV_KEY,
  ROOT,
  ROOT_ENV_KEY,
  MANIFEST_PATH,
  collectVerificationEntries,
  flattenSurfaces,
  getSurfaceGroup,
  isTestEntry,
  loadGovernanceManifest,
  readRepoFile,
  resolveManifestPath,
  resolveRepoRoot,
  repoPathExists,
};
