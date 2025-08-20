module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./tests/setup.js'],
};
