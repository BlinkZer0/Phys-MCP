module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};