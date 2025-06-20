# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Name**: lambda-adapter-kit
- **Version**: 1.0.0 (stable release)
- **Type**: TypeScript Library
- **Purpose**: Comprehensive toolkit for AWS Lambda adapters and web request/response conversion
- **Versioning**: Follows Semantic Versioning (SemVer)

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

- Main: `lambda-adapter-kit` (SvelteKit adapter)
- Converter: `lambda-adapter-kit/converter` (Event conversion utilities)
- Handler: `lambda-adapter-kit/handler` (Lambda handler utilities)
- Utils: `lambda-adapter-kit/utils` (Utility functions)

## Dependencies

- Peer dependency: `@sveltejs/kit ^2.0.0`
- Dev dependencies: TypeScript, tsup, Vitest, Biome

## Architecture Notes

### Core Components

- **Main Adapter (`src/index.ts`)** - Implements SvelteKit adapter interface for Lambda builds
- **Lambda Handler (`src/handler.ts`)** - Bridges API Gateway events to SvelteKit's fetch interface
- **Utilities (`src/utils.ts`)** - Header normalization, HTTP validation, and path sanitization

### Technical Details

- ESM-only library targeting Node.js ES2022
- Modular exports system with three entry points
- Uses Biome for consistent code style (2-space indents, single quotes)
- Strict TypeScript configuration with comprehensive type checking
- Binary content handling for Lambda responses

## Code Style Guidelines

### Comments

- Add comments only where necessary to help understand complex logic
- No comments for comments' sake - avoid obvious or redundant explanations
- Focus on explaining "why" rather than "what" for non-obvious implementation details
- Document integration points, API Gateway specifics, and RFC compliance where relevant

