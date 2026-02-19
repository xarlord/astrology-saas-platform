module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/integration/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/__tests__/performance/'],
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 30000, // Longer timeout for integration tests
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
