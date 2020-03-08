// jest.config.js
module.exports = {
    // [...]
    // Replace `ts-jest` with the preset you want to use
    // from the above list
    preset: 'ts-jest',
    testPathIgnorePatterns : [
        "<rootDir>/src/test.ts",
        "<rootDir>/src/__tests__/utils.ts",
        "<rootDir>/build",
    ],
};

