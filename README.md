# svkit-lambda-adapter

A SvelteKit adapter for deploying applications to AWS Lambda.

## Features

- 🚀 **ESM Support** - Modern ES modules with tree-shaking
- 📦 **Submodule Imports** - Import specific utilities as needed
- ⚡ **TypeScript** - Full TypeScript support with type declarations
- 🔧 **Configurable** - Flexible configuration options
- 🧪 **Well Tested** - Comprehensive test suite with Vitest
- 🎯 **AWS Lambda Optimized** - Built specifically for Lambda deployment

## Installation

```bash
npm install svkit-lambda-adapter
# or
pnpm add svkit-lambda-adapter
# or
yarn add svkit-lambda-adapter
```

## Usage

### Basic Setup

In your `svelte.config.js`:

```javascript
import adapter from 'svkit-lambda-adapter';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      env: {
        path: 'LAMBDA_PATH',
        host: 'LAMBDA_HOST',
        port: 'LAMBDA_PORT'
      }
    })
  }
};
```

### Lambda Handler

Create a Lambda handler using the provided utilities:

```javascript
import { createLambdaHandler } from 'svkit-lambda-adapter/handler';
import { handler as app } from './build/server/index.js';

export const handler = createLambdaHandler(app, {
  binaryMediaTypes: ['image/*', 'application/pdf']
});
```

### Utility Functions

Import specific utilities as needed:

```javascript
import { 
  normalizeHeaders, 
  parseMultiValueHeaders, 
  isValidHttpMethod, 
  sanitizePath 
} from 'svkit-lambda-adapter/utils';

// Normalize headers for Lambda response
const headers = normalizeHeaders(rawHeaders);

// Parse multi-value headers
const multiHeaders = parseMultiValueHeaders(headers);

// Validate HTTP method
if (isValidHttpMethod(method)) {
  // Process request
}

// Sanitize URL path
const cleanPath = sanitizePath(requestPath);
```

## Configuration Options

### Adapter Options

```typescript
interface LambdaAdapterOptions {
  out?: string;           // Output directory (default: 'build')
  precompress?: boolean;  // Enable precompression (default: false)
  env?: {
    path?: string;        // Environment variable for path
    host?: string;        // Environment variable for host
    port?: string;        // Environment variable for port
  };
}
```

### Handler Options

```typescript
interface LambdaHandlerOptions {
  binaryMediaTypes?: string[];  // Media types to encode as base64
}
```

## API Reference

### Main Exports

- `adapter(options?)` - Main SvelteKit adapter function
- `LambdaAdapterOptions` - TypeScript interface for adapter options

### Handler Exports (`svkit-lambda-adapter/handler`)

- `createLambdaHandler(app, options?)` - Create AWS Lambda handler
- `LambdaHandlerOptions` - TypeScript interface for handler options

### Utils Exports (`svkit-lambda-adapter/utils`)

- `normalizeHeaders(headers)` - Normalize header format
- `parseMultiValueHeaders(headers)` - Parse comma-separated headers
- `isValidHttpMethod(method)` - Validate HTTP method
- `sanitizePath(path)` - Clean and normalize URL paths

## Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)

### Setup

```bash
git clone <repository-url>
cd svkit-lambda-adapter
pnpm install
```

### Scripts

```bash
pnpm build          # Build the library
pnpm dev            # Build in watch mode
pnpm test           # Run tests
pnpm test:coverage  # Run tests with coverage
pnpm lint           # Check code style
pnpm lint:fix       # Fix linting issues
pnpm format         # Format code
pnpm typecheck      # Type check
```

### Project Structure

```
src/
├── index.ts       # Main adapter implementation
├── handler.ts     # Lambda handler utilities  
└── utils.ts       # Utility functions

test/
└── utils.test.ts  # Test files

dist/              # Build output
```

## Requirements

- **SvelteKit**: ^2.0.0 (peer dependency)
- **Node.js**: 18+ (Lambda runtime)
- **AWS Lambda**: Compatible with Node.js 18+ runtime

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `pnpm lint` and `pnpm test`
6. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review existing issues and discussions