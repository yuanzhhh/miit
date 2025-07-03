const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        globalThis: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // 允许 debugger 运行在开发环境中
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      // 关闭 var 关键字的提示
      'no-var': 'off',
      // 警告 case 穿透
      'no-fallthrough': 'warn',
      // 无用变量
      'no-unused-vars': 'off',
      // typescript 的无用变量
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  // Jest 测试文件专用配置
  {
    files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}', '**/test/**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
      },
      globals: {
        // Jest 全局变量
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        // Node.js 全局变量
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // 允许 debugger 运行在开发环境中
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      // 关闭 var 关键字的提示
      'no-var': 'off',
      // 警告 case 穿透
      'no-fallthrough': 'warn',
      // 无用变量
      'no-unused-vars': 'off',
      // typescript 的无用变量
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'types/**', 'coverage/**', '*.min.js', 'stats.html'],
  },
];
