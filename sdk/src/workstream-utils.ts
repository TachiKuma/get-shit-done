/**
 * Workstream utility functions for multi-workstream project support.
 *
 * When --ws <name> is provided, all .planning/ paths are routed to
 * .planning/workstreams/<name>/ instead.
 *
 * Brand-aware planning root contract (mirrors get-shit-done/bin/lib/core.cjs):
 * - 'official' (default): planning root is `.planning`
 * - 'gsdcn': planning root is `.planning-gsdcn`
 *
 * This mapping MUST stay in sync with BRAND_ROOT_MAP in core.cjs.
 * Both CLI and SDK read the same brand → root directory rule so that
 * switching brands never causes a CLI/SDK state-root split.
 */

import { posix } from 'node:path';

// ─── Brand-aware planning root ────────────────────────────────────────────────

/**
 * Brand identifiers supported by the GSD-CN compatibility layer.
 */
export type GsdbrandId = 'official' | 'gsdcn';

/**
 * Canonical brand → planning root directory name mapping.
 * Single source of truth on the SDK side, mirroring BRAND_ROOT_MAP in core.cjs.
 */
export const BRAND_ROOT_MAP: Record<GsdbrandId, string> = {
  official: '.planning',
  gsdcn: '.planning-gsdcn',
};

/**
 * Resolve the planning root directory name for a given brand.
 *
 * Priority order:
 * 1. Explicit `brand` argument
 * 2. `GSD_BRAND` environment variable (Node.js process.env)
 * 3. Falls back to 'official' → `.planning`
 *
 * This function is the SDK counterpart of `resolvePlanningRootName()` in core.cjs.
 * Both functions MUST return the same value for any given brand input.
 *
 * @param brand - explicit brand identifier; omit to read from GSD_BRAND env var
 * @returns the planning root directory name (e.g. '.planning' or '.planning-gsdcn')
 */
export function resolvePlanningRootName(brand?: GsdbrandId | string): string {
  const resolved = (brand ?? (typeof process !== 'undefined' ? process.env['GSD_BRAND'] : undefined) ?? 'official') as string;
  return (BRAND_ROOT_MAP as Record<string, string>)[resolved] ?? BRAND_ROOT_MAP.official;
}

// ─── Workstream / path helpers ────────────────────────────────────────────────

/**
 * Validate a workstream name.
 * Allowed: alphanumeric, hyphens, underscores, dots.
 * Disallowed: empty, spaces, slashes, special chars, path traversal.
 */
export function validateWorkstreamName(name: string): boolean {
  if (!name || name.length === 0) return false;
  // Only allow alphanumeric, hyphens, underscores, dots
  // Must not be ".." or start with ".." (path traversal)
  if (name === '..' || name.startsWith('../')) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name);
}

/**
 * Return the relative planning directory path.
 *
 * Brand-aware: the root segment is determined by `resolvePlanningRootName(brand)`.
 *
 * - Official GSD (default): `.planning` or `.planning/workstreams/<name>`
 * - GSD-CN:                 `.planning-gsdcn` or `.planning-gsdcn/workstreams/<name>`
 *
 * @param workstream - optional workstream name
 * @param brand - optional explicit brand; falls back to GSD_BRAND env var → 'official'
 */
export function relPlanningPath(workstream?: string, brand?: GsdbrandId | string): string {
  const root = resolvePlanningRootName(brand);
  if (!workstream) return root;
  // Use POSIX segments so the same logical path string is used on all platforms (Windows included).
  return posix.join(root, 'workstreams', workstream);
}
