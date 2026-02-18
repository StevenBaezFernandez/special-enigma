
module.exports = {
  displayName: 'identity-presentation',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/domains/identity/presentation',
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)']
};
