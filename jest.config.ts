import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/db/",
    "/src/constants",
    "/src/routes",
  ],
  coverageProvider: "v8",
  coverageReporters: ["json", "text", "lcov", "clover"],
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["js", "ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: ["<rootDir>/src"],
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
  watchPathIgnorePatterns: [
    "/node_modules/",
    "/src/db/",
    "/src/constants",
    "/src/routes",
  ],
};

export default config;
