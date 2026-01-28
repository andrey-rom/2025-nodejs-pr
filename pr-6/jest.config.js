/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.entity.ts", "!src/database/**"],
  coverageDirectory: "coverage",
  verbose: true,
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        types: ["jest", "node"],
        esModuleInterop: true,
        strict: false,
      }
    }]
  },
};
