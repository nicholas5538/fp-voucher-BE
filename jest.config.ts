import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/db/",
    "/src/constants",
    "/src/index.ts",
    "/src/routes",
    // This cannot be tested as secret OAuth code is not a constant
    "/src/controllers/google-auth.ts",
  ],
  coverageProvider: "v8",
  coverageReporters: ["json", "text", "lcov", "clover"],
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: ["<rootDir>/src"],
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  verbose: true,
  watchPathIgnorePatterns: ["/node_modules/", "/src/db/", "/src/constants"],
};

export default config;
