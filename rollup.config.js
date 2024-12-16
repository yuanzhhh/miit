import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';
const external = Object.keys(pkg.dependencies || {});

const plugins = [
  resolve({
    preferBuiltins: true,
    extensions: ['.ts', '.js', '.json'],
  }),
  commonjs(),
  json(),
  esbuild({
    target: 'es2020',
    minify: process.env.NODE_ENV === 'production',
  }),
];

const output = {
  banner: `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`,
};

export default defineConfig([
  // ESM & CJS builds
  {
    input,
    external,
    plugins,
    output: [
      {
        ...output,
        format: 'es',
        file: pkg.module,
        sourcemap: true,
      },
      {
        ...output,
        format: 'cjs',
        file: pkg.main,
        sourcemap: true,
      },
    ],
  },
  // Types
  {
    input,
    output: {
      file: pkg.types,
      format: 'es',
    },
    plugins: [dts()],
  },
]);
