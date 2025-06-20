# lambda-adapter-kit

A comprehensive toolkit for AWS Lambda adapters and web request/response conversion. Includes SvelteKit adapter, event converters, and utilities for seamless Lambda integration.

## What's Included

This toolkit provides everything you need for Lambda integration:

- **🧩 SvelteKit Adapter** - Drop-in adapter for SvelteKit applications
- **🔄 Event Converters** - Bidirectional conversion between Lambda events and Web API objects
- **🛠️ Handler Utilities** - Tools for creating robust Lambda handlers
- **⚙️ Utility Functions** - Header normalization, path sanitization, and validation helpers

Perfect for SvelteKit apps, custom Lambda functions, or any web framework that needs Lambda integration.

> **Future-Ready**: Designed to support additional framework adapters (Next.js, Nuxt, etc.) in upcoming releases.

## Features

- 🚀 **ESM Support** - Modern ES modules with tree-shaking
- 📦 **Submodule Imports** - Import specific utilities as needed
- ⚡ **TypeScript** - Full TypeScript support with type declarations
- 🔧 **Configurable** - Flexible configuration options
- 🧪 **Well Tested** - Comprehensive test suite with Vitest
- 🎯 **AWS Lambda Optimized** - Built specifically for Lambda deployment
- 🔄 **Event Conversion** - Bidirectional Lambda event and web request conversion
- 🍪 **Cookie Support** - Proper handling of multiple Set-Cookie headers
- 📁 **Binary Content** - Smart binary content detection with compression support
- 🔀 **Multi-Value Headers** - Support for API Gateway and ALB response formats
- 🧩 **SvelteKit Adapter** - Ready-to-use SvelteKit adapter included
- 🛠️ **Framework Agnostic** - Core utilities work with any web framework

## Installation

```bash
npm install lambda-adapter-kit
# or
pnpm add lambda-adapter-kit
# or
yarn add lambda-adapter-kit
```

## Usage

### Basic Setup

In your `svelte.config.js`:

```javascript
import adapter from 'lambda-adapter-kit';

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
import { createLambdaHandler } from 'lambda-adapter-kit/handler';
import { handler as app } from './build/server/index.js';

export const handler = createLambdaHandler(app, {
  binaryMediaTypes: ['image/*', 'application/pdf']
});
```

### Event Conversion

Convert between Lambda events and web requests/responses:

```javascript
import { 
  convertLambdaEventToWebRequest, 
  convertWebResponseToLambdaEvent 
} from 'lambda-adapter-kit/converter';

// Convert Lambda event to Web Request
const request = convertLambdaEventToWebRequest(lambdaEvent);

// Convert Web Response to Lambda event format
const lambdaResponse = await convertWebResponseToLambdaEvent(response, {
  binaryMediaTypes: ['image/*', 'application/pdf'],
  multiValueHeaders: false // Use true for ALB events
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
} from 'lambda-adapter-kit/utils';

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

## Advanced Features

### Binary Content Detection

The adapter automatically detects binary content using multiple strategies:

```javascript
// Automatic detection based on content-type
const response = new Response(imageData, {
  headers: { 'content-type': 'image/png' }
});

// Compression detection (gzip, deflate, br, compress)
const compressedResponse = new Response(data, {
  headers: { 
    'content-type': 'text/html',
    'content-encoding': 'gzip' 
  }
});

// Custom binary media types
const result = await convertWebResponseToLambdaEvent(response, {
  binaryMediaTypes: ['application/custom', 'image/*']
});
```

### Multi-Value Headers and Cookies

Proper handling of multiple cookies and headers:

```javascript
// Multiple Set-Cookie headers are preserved
const response = new Response('OK');
response.headers.append('set-cookie', 'session=abc123; HttpOnly');
response.headers.append('set-cookie', 'theme=dark; Path=/');

const lambdaEvent = await convertWebResponseToLambdaEvent(response);
// Result includes multiValueHeaders: { 'Set-Cookie': ['session=abc123; HttpOnly', 'theme=dark; Path=/'] }
```

### Lambda Event Types

Supports all major AWS Lambda event types:

- **API Gateway v1.0** - With multi-value headers and query parameters
- **API Gateway v2.0** - With raw query strings and cookies array  
- **Application Load Balancer (ALB)** - With multi-value header support

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

### Response Conversion Options

```typescript
interface ResponseConversionOptions {
  binaryMediaTypes?: string[];  // Media types to encode as base64
  multiValueHeaders?: boolean;  // Use multi-value headers format (for ALB)
}
```

## API Reference

### Main Exports

- `adapter(options?)` - Main SvelteKit adapter function
- `LambdaAdapterOptions` - TypeScript interface for adapter options

### Handler Exports (`lambda-adapter-kit/handler`)

- `createLambdaHandler(app, options?)` - Create AWS Lambda handler
- `LambdaHandlerOptions` - TypeScript interface for handler options

### Converter Exports (`lambda-adapter-kit/converter`)

- `convertLambdaEventToWebRequest(event)` - Convert Lambda event to Web Request
- `convertWebResponseToLambdaEvent(response, options?)` - Convert Web Response to Lambda event
- `ResponseConversionOptions` - TypeScript interface for conversion options
- `LambdaEvent` - Union type for all supported Lambda event types

### Utils Exports (`lambda-adapter-kit/utils`)

- `normalizeHeaders(headers)` - Normalize header format
- `parseMultiValueHeaders(headers)` - Parse comma-separated headers
- `isValidHttpMethod(method)` - Validate HTTP method
- `sanitizePath(path)` - Clean and normalize URL paths

## Development

### Prerequisites

- Node.js 20+ (recommended: 22 LTS)
- pnpm (recommended)

### Setup

```bash
git clone <repository-url>
cd lambda-adapter-kit
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
├── index.ts         # Main adapter implementation
├── handler.ts       # Lambda handler utilities
├── converter.ts     # Event conversion utilities
└── utils.ts         # Utility functions

test/
├── utils.test.ts      # Utility function tests
└── converter.test.ts  # Event conversion tests

dist/                # Build output
```

## Requirements

- **SvelteKit**: ^2.0.0 (peer dependency)
- **Node.js**: 20+ (recommended: 22 LTS)
- **AWS Lambda**: Compatible with Node.js 20+ runtime (supports nodejs22.x)

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