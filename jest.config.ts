import type { Config } from "jest";

const config: Config = {
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
  moduleFileExtensions: ["js", "ts"],
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  verbose: true,
  watchPathIgnorePatterns: [
    "/node_modules/",
    "/src/db/",
    "/src/constants",
    "/src/routes",
  ],
};

export default config;
