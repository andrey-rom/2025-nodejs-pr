/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.entity.ts",
    "!src/database/**",
    "!src/models/**",
    "!src/index.ts",
    "!src/utils/logger.ts",
    "!src/routes/**",
    "!src/swagger/**",
    "!src/types/**",
    "!src/__tests__/**",
    "!src/**/*.integration.test.ts",
    "!src/**/*.e2e.test.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
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
