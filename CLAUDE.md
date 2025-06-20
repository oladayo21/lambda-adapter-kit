# Claude Code Configuration

This file contains information for Claude Code to understand and work with this project.

## Project Overview
- **Name**: svkit-lambda-adapter
- **Type**: TypeScript Library
- **Purpose**: SvelteKit adapter for AWS Lambda deployment

## Development Setup
- **Package Manager**: pnpm
- **Build Tool**: tsup
- **Testing**: Vitest
- **Linting/Formatting**: Biome
- **TypeScript**: Yes (strict mode)

## Key Scripts
- `pnpm build` - Build the library using tsup
- `pnpm dev` - Build in watch mode
- `pnpm test` - Run tests with Vitest
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Check code with Biome
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Type check with TypeScript

## Project Structure
```
src/
├── index.ts      # Main adapter export
├── handler.ts    # Lambda handler utilities
└── utils.ts      # Utility functions

test/
└── utils.test.ts # Test files

dist/             # Build output (generated)
```

## Exports
The library provides multiple entry points:
- Main: `svkit-lambda-adapter`
- Handler: `svkit-lambda-adapter/handler`
- Utils: `svkit-lambda-adapter/utils`

## Dependencies
- Peer dependency: `@sveltejs/kit ^2.0.0`
- Dev dependencies: TypeScript, tsup, Vitest, Biome

## Notes
- ESM-only library
- Targets Node.js ES2022
- Uses Biome for consistent code style
- All code should be formatted and linted before commits