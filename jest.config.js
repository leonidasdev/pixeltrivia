const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment for React components
  testEnvironment: 'jest-environment-jsdom',

  // Module path aliases matching tsconfig.json
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test file patterns - only run __tests__ folder, not Playwright tests in /tests
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],

  // Files to ignore - exclude Playwright tests and node_modules
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/'],

  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!**/node_modules/**',
  ],

  // Coverage thresholds — raised to protect against regressions
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 83,
    },
  },
}

// Export the config wrapped with Next.js config
module.exports = createJestConfig(customJestConfig)
