const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const nativeWindConfig = withNativeWind(config, { input: './global.css' });

// react-native-worklets uses private class fields (#) that Hermes requires transpiled
nativeWindConfig.transformer.transformIgnorePatterns = [
  'node_modules/(?!(react-native|@react-native|react-native-worklets|react-native-reanimated|expo|@expo|@unimodules|nativewind|react-native-css-interop|react-native-safe-area-context|react-native-screens|react-native-gesture-handler)/)',
];

module.exports = nativeWindConfig;
