module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverage: true,
  coverageDirectory: '../coverage',
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@meals/(.*)$': '<rootDir>/meals/$1',  
    '^@categories/(.*)$': '<rootDir>/categories/$1',  
    '^@orders/(.*)$': '<rootDir>/orders/$1', 
  },
};