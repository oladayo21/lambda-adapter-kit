# lambda-adapter-kit

Lambda event and web request/response conversion utilities for seamless AWS Lambda integration.

## Installation

```bash
npm install lambda-adapter-kit
# or
pnpm add lambda-adapter-kit
# or
yarn add lambda-adapter-kit
```

## Usage

This package provides two core functions for converting between AWS Lambda events and standard Web API objects:

### `convertLambdaEventToWebRequest(event)`

Converts an AWS Lambda event to a standard Web API `Request` object.

```typescript
import { convertLambdaEventToWebRequest } from 'lambda-adapter-kit';

// Lambda handler
export const handler = async (event, context) => {
  // Convert Lambda event to Web Request
  const request = convertLambdaEventToWebRequest(event);
  
  // Now you can use standard Web API methods
  const url = new URL(request.url);
  const method = request.method;
  const body = await request.text();
  const headers = request.headers;
  
  // Your application logic here...
  const response = new Response('Hello World', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
  
  // Convert back to Lambda format
  return await convertWebResponseToLambdaEvent(response);
};
```

### `convertWebResponseToLambdaEvent(response, options?)`

Converts a standard Web API `Response` object to AWS Lambda event response format.

```typescript
import { convertWebResponseToLambdaEvent } from 'lambda-adapter-kit';

// Create a standard Web Response
const response = new Response(JSON.stringify({ message: 'Hello World' }), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Set-Cookie': 'session=abc123; HttpOnly'
  }
});

// Convert to Lambda response format
const lambdaResponse = await convertWebResponseToLambdaEvent(response, {
  binaryMediaTypes: ['image/*', 'application/pdf'],
  multiValueHeaders: false // Set to true for ALB events
});

// Returns: { statusCode: 200, headers: {...}, body: "...", isBase64Encoded: false }
```

## Supported Lambda Event Types

- **API Gateway v1.0** - Original REST API format
- **API Gateway v2.0** - HTTP API format with simplified structure  
- **Application Load Balancer (ALB)** - ALB target group integration

## Features

- **Automatic Binary Detection** - Detects binary content by content-type and content-encoding
- **Cookie Handling** - Properly handles multiple `Set-Cookie` headers
- **Multi-Value Headers** - Supports both single and multi-value header formats
- **Compression Support** - Automatically detects compressed content (gzip, deflate, br, compress)
- **TypeScript** - Full type safety with comprehensive type definitions

## Options

### `ResponseConversionOptions`

```typescript
interface ResponseConversionOptions {
  binaryMediaTypes?: string[];  // Media types to encode as base64
  multiValueHeaders?: boolean;  // Use multi-value headers format (for ALB)
}
```

**Binary Media Types Examples:**
- `['image/*', 'application/pdf']` - Specific types
- `['application/*']` - Wildcard patterns
- `['*/*']` - All content types

## Utility Functions

Additional framework-agnostic utilities are available:

```typescript
import { 
  normalizeHeaders, 
  parseMultiValueHeaders, 
  isValidHttpMethod, 
  sanitizePath 
} from 'lambda-adapter-kit';

// Normalize headers for consistent format
const headers = normalizeHeaders(rawHeaders);

// Parse comma-separated header values  
const multiHeaders = parseMultiValueHeaders(headers);

// Validate HTTP method
if (isValidHttpMethod(method)) {
  // Process request
}

// Clean and normalize URL paths
const cleanPath = sanitizePath('/path//with///extra/slashes/');
// Returns: '/path/with/extra/slashes'
```

## TypeScript Support

All functions and types are fully typed:

```typescript
import type { LambdaEvent, ResponseConversionOptions } from 'lambda-adapter-kit';

// LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent
function handleLambdaEvent(event: LambdaEvent) {
  return convertLambdaEventToWebRequest(event);
}
```

## Requirements

- **Node.js**: 20+ (recommended: 22 LTS)
- **AWS Lambda**: Compatible with Node.js 20+ runtime (supports nodejs22.x)

## License

MIT