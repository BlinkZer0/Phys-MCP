module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts'
  ]
};
