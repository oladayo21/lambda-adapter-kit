# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Name**: lambda-adapter-kit
- **Version**: 1.0.1-2
- **Type**: TypeScript Library
- **Purpose**: Framework-agnostic Lambda event and web request/response conversion utilities
- **Focus**: Core converter functions and handler utilities
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
├── index.ts      # Core functions export (converters, handlers, utils)
├── converter.ts  # Event conversion utilities
├── handler.ts    # Lambda handler utilities
└── utils.ts      # Utility functions

test/             # Test files
├── converter.test.ts
├── handler.test.ts
├── integration.test.ts
└── utils.test.ts

dist/             # Build output (generated)
```

## Exports

The library provides a single entry point:

- **Main**: `@foladayo/lambda-adapter-kit` (Framework-agnostic converters, handlers, utilities)

## Related Packages

- **SvelteKit Adapter**: `@foladayo/sveltekit-adapter-lambda` (Uses this package as dependency)

## Dependencies

- **No runtime dependencies** - Zero-dependency package
- Dev dependencies: TypeScript, tsup, Vitest, Biome

## Architecture Notes

### Core Components

- **Event Converters (`src/converter.ts`)** - Convert Lambda events ↔ Web API Request/Response
- **Handler Utilities (`src/handler.ts`)** - Framework-agnostic Lambda handler creation
- **Utilities (`src/utils.ts`)** - Header normalization, HTTP validation, and path sanitization

### Technical Details

- ESM-only library targeting Node.js ES2022
- Zero runtime dependencies for maximum compatibility
- Uses Biome for consistent code style (2-space indents, single quotes)
- Strict TypeScript configuration with comprehensive type checking
- Supports all Lambda event types (API Gateway v1/v2, ALB, Function URLs)
- Framework-agnostic design works with any fetch-based application

## Code Style Guidelines

### Comments

- Add comments only where necessary to help understand complex logic
- No comments for comments' sake - avoid obvious or redundant explanations
- Focus on explaining "why" rather than "what" for non-obvious implementation details
- Document integration points, API Gateway specifics, and RFC compliance where relevant

## Development Workflow

- Make sure that after every change you run all necessary checks for linting, formatting and tests