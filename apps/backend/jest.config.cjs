module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: {
        module: 'commonjs',
        target: 'ES2022',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        strict: true,
      },
    }],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
