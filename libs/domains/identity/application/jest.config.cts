
module.exports = {
  displayName: 'identity-application',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/domains/identity/application',
  transformIgnorePatterns: ['node_modules/(?!(uuid|otplib|@otplib|@scure|@noble)/)']
};
