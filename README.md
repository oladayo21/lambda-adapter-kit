# lambda-adapter-kit

**Framework-agnostic AWS Lambda event and web request/response conversion utilities**

[![npm version](https://img.shields.io/npm/v/@foladayo/lambda-adapter-kit)](https://www.npmjs.com/package/@foladayo/lambda-adapter-kit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

Convert between AWS Lambda events and standard Web API requests/responses for any framework.

> **Inspiration**: This package is heavily inspired by the [Hono.js AWS Lambda adapter](https://hono.dev/getting-started/aws-lambda), reimagined as a framework-agnostic utility library.

## Installation

```bash
npm install @foladayo/lambda-adapter-kit
# or
pnpm add @foladayo/lambda-adapter-kit
# or
yarn add @foladayo/lambda-adapter-kit
```

## Quick Start

### Basic Event Conversion

```javascript
import { convertLambdaEventToWebRequest, convertWebResponseToLambdaEvent } from "@foladayo/lambda-adapter-kit";

export const handler = async (event, context) => {
  // Convert Lambda event → Web Request
  const request = convertLambdaEventToWebRequest(event);

  // Your app logic here
  const response = new Response("Hello World", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });

  // Convert Web Response → Lambda response
  return await convertWebResponseToLambdaEvent(response);
};
```

### Framework Handler

```javascript
import { createLambdaHandler } from "@foladayo/lambda-adapter-kit";

// Works with any framework that has a fetch method
const app = {
  fetch: async (request) => {
    return new Response(`Hello ${new URL(request.url).pathname}`);
  },
};

export const handler = createLambdaHandler(app, {
  binaryMediaTypes: ["image/*"],
});
```

## What's Included

- **🔄 Event Converters** - Lambda ↔ Web API conversion
- **🛠️ Handler Utilities** - Framework-agnostic Lambda handlers
- **🎯 TypeScript Ready** - Full type safety
- **⚡ Zero Dependencies** - Lightweight and fast
- **🔧 Framework Agnostic** - Works with any fetch-based framework

## Core Functions

### `convertLambdaEventToWebRequest(event)`

Converts an AWS Lambda event to a standard Web API `Request` object.

```typescript
import { convertLambdaEventToWebRequest } from "@foladayo/lambda-adapter-kit";

// Supports: API Gateway v1/v2, ALB, Lambda Function URLs
const request = convertLambdaEventToWebRequest(event);

// Now you can use standard Web API methods
const url = new URL(request.url);
const method = request.method;
const body = await request.text();
const headers = request.headers;
```

### `convertWebResponseToLambdaEvent(response, options?)`

Converts a standard Web API `Response` object to AWS Lambda event response format.

```typescript
import { convertWebResponseToLambdaEvent } from "@foladayo/lambda-adapter-kit";

const response = new Response(JSON.stringify({ message: "Hello World" }), {
  status: 200,
  headers: {
    "Content-Type": "application/json",
    "Set-Cookie": "session=abc123; HttpOnly",
  },
});

const lambdaResponse = await convertWebResponseToLambdaEvent(response, {
  binaryMediaTypes: ["image/*", "application/pdf"],
  multiValueHeaders: false, // Set to true for ALB events
});

// Returns: { statusCode: 200, headers: {...}, body: "...", isBase64Encoded: false }
```

### `createLambdaHandler(app, options?)`

Create a Lambda handler for any framework that implements the fetch interface:

```typescript
import { createLambdaHandler } from "@foladayo/lambda-adapter-kit";

// For any framework with a fetch method
const app = {
  fetch: async (request) => {
    // Your application logic
    return new Response("Hello World");
  },
};

// Create Lambda handler
export const handler = createLambdaHandler(app, {
  binaryMediaTypes: ["image/*"],
  multiValueHeaders: false, // Set to true for ALB events
});
```

## Utility Functions

Additional framework-agnostic utilities:

```typescript
import {
  normalizeHeaders,
  parseMultiValueHeaders,
  isValidHttpMethod,
  sanitizePath,
} from "@foladayo/lambda-adapter-kit";

// Normalize headers for consistent format
const headers = normalizeHeaders(rawHeaders);

// Parse comma-separated header values
const multiHeaders = parseMultiValueHeaders(headers);

// Validate HTTP method
if (isValidHttpMethod("POST")) {
  // Process request
}

// Clean and normalize URL paths
const cleanPath = sanitizePath("/api//users///123"); // → '/api/users/123'
```

## Supported Lambda Events

| Event Type                          | Support | Notes               |
| ----------------------------------- | ------- | ------------------- |
| **API Gateway v1**                  | ✅      | REST API format     |
| **API Gateway v2**                  | ✅      | HTTP API format     |
| **ALB (Application Load Balancer)** | ✅      | Multi-value headers |
| **Lambda Function URLs**            | ✅      | Direct invocation   |

## Features

- **🔄 Automatic Binary Detection** - Content-type based base64 encoding
- **🍪 Cookie Handling** - Proper `Set-Cookie` header support
- **📦 Multi-Value Headers** - ALB and API Gateway compatibility
- **🗜️ Compression Support** - Gzip, deflate, brotli detection
- **🛡️ Type Safety** - Complete TypeScript definitions
- **🔧 Framework Agnostic** - Works with any fetch-based framework
- **⚡ Zero Dependencies** - Lightweight and fast

## TypeScript Support

All functions and types are fully typed:

```typescript
import type {
  LambdaEvent, // Union of all Lambda event types
  ResponseConversionOptions, // Response conversion options
  FetchApp, // App interface for handlers
  LambdaHandlerOptions, // Handler configuration
} from "@foladayo/lambda-adapter-kit";

// LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent
function handleLambdaEvent(event: LambdaEvent) {
  return convertLambdaEventToWebRequest(event);
}
```

## Framework Integrations

### SvelteKit

For SvelteKit applications, use the dedicated adapter:

```bash
npm install @foladayo/sveltekit-adapter-lambda
```

```javascript
// svelte.config.js
import adapter from "@foladayo/sveltekit-adapter-lambda";

export default {
  kit: {
    adapter: adapter(),
  },
};
```

### Other Frameworks

This package can be used with any framework that supports the fetch interface:

- **Hono** - Fast web framework

## Examples

### Hono Integration

```typescript
import { Hono } from "hono";
import { createLambdaHandler } from "@foladayo/lambda-adapter-kit";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));
app.post("/api/users", async (c) => {
  const user = await c.req.json();
  return c.json({ id: 1, ...user });
});

export const handler = createLambdaHandler(app);
```

## Requirements

- **Node.js**: 20+ (AWS Lambda nodejs20.x runtime)

## Contributing

```bash
git clone https://github.com/oladayo21/lambda-adapter-kit
cd lambda-adapter-kit
pnpm install
pnpm test
```

## License

MIT © [Foladayo](https://github.com/oladayo21)
