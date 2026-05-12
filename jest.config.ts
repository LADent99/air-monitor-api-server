import type { Config } from 'jest';

const moduleNameMapper = { '^@/(.*)$': '<rootDir>/src/$1' };

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      transform: { '^.+\\.ts$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
      moduleNameMapper,
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
      transform: { '^.+\\.ts$': 'ts-jest' },
      moduleFileExtensions: ['ts', 'js', 'json'],
      testTimeout: 30000,
      moduleNameMapper,
      setupFiles: ['<rootDir>/test/helpers/env.ts'],
    },
  ],
};

export default config;
