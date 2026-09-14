module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transformIgnorePatterns: [
    // Windows-safe: match both / and \ path separators after "node_modules"
    'node_modules[\\/](?!(jest-)?react-native|@react-native(?:-community)?|@react-navigation|@expo(nent)?|expo(nent)?|@expo-google-fonts/.*|@sentry/.*|react-native-svg|react-native-reanimated|lucide-react-native)',
  ],
};
