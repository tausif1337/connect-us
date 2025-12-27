// Simplified Jest config without Expo preset
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/pure.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
