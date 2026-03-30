const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution
config.resolver.unstable_enablePackageExports = true;
// Use CJS conditions to avoid ESM files with import.meta (not supported by Hermes/Metro)
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];

module.exports = config;
