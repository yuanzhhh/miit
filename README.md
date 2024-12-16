# Rollup Boilerplate

A modern boilerplate for building TypeScript libraries with Rollup.

## Features

- [Rollup](https://rollupjs.org/) for bundling
- TypeScript support with [rollup-plugin-typescript2](https://github.com/ezolenko/rollup-plugin-typescript2)
- Fast bundling with [esbuild](https://esbuild.github.io/)
- Testing with [Jest](https://jestjs.io/)
- Linting with [ESLint](https://eslint.org/)
- Code formatting with [Prettier](https://prettier.io/)
- Git hooks with [husky](https://typicode.github.io/husky/)
- TypeScript declaration files
- Watch mode for development
- CommonJS and ES Module outputs

## Installation

```bash
pnpm install
```

## Scripts

- `pnpm dev` - Start development in watch mode
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm coverage` - Run tests with coverage report
- `pnpm lint` - Lint code
- `pnpm format` - Format code
- `pnpm typecheck` - Check types

## Project Structure

```
.
├── src/           # Source files
├── __tests__/     # Test files
├── dist/          # Built files (generated)
├── types/         # Type declarations (generated)
└── package.json   # Project manifest
```

## Building Your Library

1. Write your code in the `src` directory
2. Add tests in the `__tests__` directory
3. Build your library with `pnpm build`
4. Publish to npm with `npm publish`

## License

MIT
