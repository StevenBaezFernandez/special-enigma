module.exports = {
  displayName: 'virteex-identity-service',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^otplib$': '<rootDir>/../../../../node_modules/otplib/dist/index.cjs',
    '^@noble/hashes/(.*)$': [
      '<rootDir>/../../../../node_modules/@noble/hashes/$1',
      '<rootDir>/../../../../node_modules/@otplib/plugin-crypto-noble/node_modules/@noble/hashes/$1'
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@scure|otplib|@noble|@apollo/server|@otplib)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/virteex-identity-service',
};
