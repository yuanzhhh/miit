const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const { visualizer } = require('rollup-plugin-visualizer');
const { default: esbuild } = require('rollup-plugin-esbuild');
const { default: dts } = require('rollup-plugin-dts');

const isProduction = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts'];

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: !isProduction,
      },
      {
        file: 'dist/index.es.js',
        format: 'es',
        sourcemap: !isProduction,
      },
    ],
    plugins: [
      nodeResolve({ extensions }),
      commonjs(),
      typescript(),
      babel({
        extensions,
        babelHelpers: 'bundled',
        include: ['src/**/*'],
      }),
      esbuild({
        minify: isProduction,
        sourceMap: !isProduction,
        target: 'es2015',
      }),
      visualizer({
        filename: 'stats.html',
        title: 'Rollup Visualizer',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'types/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

module.exports = config;
