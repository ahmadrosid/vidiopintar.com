// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './', // Path to Next.js app
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you have a setup file
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // Handle module aliases
  },
}

module.exports = createJestConfig(customJestConfig)
