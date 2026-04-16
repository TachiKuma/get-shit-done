/**
 * Locale — canonical locale normalization and runtime locale helpers
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_LOCALE = 'en';

const CANONICAL_LOCALES = Object.freeze([
  'en',
  'zh-CN',
  'ja-JP',
  'ko-KR',
  'pt-BR',
]);

const LOCALE_ALIASES = Object.freeze({
  en: 'en',
  english: 'en',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  chinese: 'zh-CN',
  'simplified chinese': 'zh-CN',
  ja: 'ja-JP',
  'ja-jp': 'ja-JP',
  japanese: 'ja-JP',
  ko: 'ko-KR',
  'ko-kr': 'ko-KR',
  korean: 'ko-KR',
  pt: 'pt-BR',
  'pt-br': 'pt-BR',
  portuguese: 'pt-BR',
  'portuguese (brazil)': 'pt-BR',
  'brazilian portuguese': 'pt-BR',
});

function normalizeLocale(value) {
  if (value === undefined || value === null) return null;

  const normalizedInput = String(value)
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, ' ');

  if (!normalizedInput) return null;

  const aliasKey = normalizedInput.toLowerCase();
  return LOCALE_ALIASES[aliasKey] || DEFAULT_LOCALE;
}

function getLocaleFallbackChain(value) {
  const locale = normalizeLocale(value) || DEFAULT_LOCALE;
  return locale === DEFAULT_LOCALE
    ? [DEFAULT_LOCALE]
    : [locale, DEFAULT_LOCALE];
}

function getLocaleCatalogPath(locale, namespace) {
  if (!/^[a-z0-9_-]+$/i.test(namespace)) {
    throw new Error(`Invalid locale namespace: ${namespace}`);
  }

  return path.join(__dirname, '..', '..', 'locales', locale, `${namespace}.json`);
}

function readLocaleCatalog(locale, namespace) {
  const catalogPath = getLocaleCatalogPath(locale, namespace);
  if (!fs.existsSync(catalogPath)) return {};
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

function loadLocaleCatalog(namespace, locale) {
  const fallbackChain = getLocaleFallbackChain(locale);
  const merged = {};

  for (const fallbackLocale of fallbackChain.slice().reverse()) {
    Object.assign(merged, readLocaleCatalog(fallbackLocale, namespace));
  }

  return merged;
}

module.exports = {
  DEFAULT_LOCALE,
  CANONICAL_LOCALES,
  LOCALE_ALIASES,
  normalizeLocale,
  getLocaleFallbackChain,
  getLocaleCatalogPath,
  loadLocaleCatalog,
};
