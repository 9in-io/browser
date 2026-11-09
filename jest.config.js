module.exports = {
    clearMocks: true,
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    transform: {'^.+\\.ts$': ['ts-jest', {tsconfig: {module: 'commonjs', target: 'es2022', esModuleInterop: true, isolatedModules: true}}]},
};
