import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/test/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
      useESM: true
    }
  },
  verbose: true
};