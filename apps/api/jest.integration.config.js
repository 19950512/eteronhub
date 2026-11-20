module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testRegex: ".*\\.int-spec\\.ts$",
  testTimeout: 30_000,
};
