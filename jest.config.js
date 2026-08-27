/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Source uses explicit .js extensions on relative imports (required so the
    // emitted .d.ts files resolve under node16); strip them for ts-jest.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  // Coverage measures the library only. App.tsx/dev.tsx are the local demo
  // playground, and main.ts is a re-export barrel with no logic.
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/App.tsx',
    '!src/dev.tsx',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 85,
      lines: 80,
      statements: 80,
    },
  },
};