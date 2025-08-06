module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testMatch: ["<rootDir>/test/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/data/store.js", // exclude store as it's just in-memory storage
  ],
  verbose: true,
  testTimeout: 10000,
  maxWorkers: 1, // Run tests sequentially to avoid data conflicts
};
