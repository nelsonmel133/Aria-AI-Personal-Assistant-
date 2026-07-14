module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@aria/tokens$": "<rootDir>/packages/tokens/src/index.json",
    "^@aria/ui$": "<rootDir>/packages/ui/src/index.ts",
    "^@aria/api-client$": "<rootDir>/packages/api-client/src/index.ts",
  },
  setupFilesAfterFramework: ["@testing-library/jest-native/extend-expect"],
};
