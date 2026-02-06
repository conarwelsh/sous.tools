import baseConfig from '../../packages/eslint-config/index.js';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {
      // Package-specific overrides
    },
  },
];
