module.exports = {
  displayName: 'bi-infrastructure',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/domains/bi/infrastructure',
  moduleNameMapper: {
    '^uuid$': '<rootDir>/src/test-setup/uuid-mock.js'
  }
};
