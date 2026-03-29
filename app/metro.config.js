const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution for better tree-shaking
// and to allow bundlers to pick the correct ESM entry points.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
