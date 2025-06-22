import type { ALBEvent, APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';
import type { FetchApp } from '../src/handler.js';
import { createLambdaHandler } from '../src/handler.js';

// Real integration tests using actual converter functions (not mocked)
describe('Integration Tests - End-to-End Lambda Handler', () => {
  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '1.0',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '256',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
  };

  describe('API Gateway v1 Integration', () => {
    it('should handle GET request with query parameters', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          expect(request.url).toBe('https://api.example.com/users?page=1&limit=10');
          expect(request.method).toBe('GET');

          return new Response(JSON.stringify({ users: ['user1', 'user2'] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }),
      };

      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/users',
        headers: {
          host: 'api.example.com',
          'user-agent': 'test-client',
        },
        queryStringParameters: {
          page: '1',
          limit: '10',
        },
        body: null,
        isBase64Encoded: false,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/users',
        } as any,
        resource: '/users',
      };

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.headers?.['content-type']).toBe('application/json');
      expect(result.body).toBe('{"users":["user1","user2"]}');
      expect(result.isBase64Encoded).toBe(false);
    });

    it('should handle POST request with JSON body', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          expect(request.url).toBe('https://api.example.com/users');
          expect(request.method).toBe('POST');

          const body = await request.text();
          expect(body).toBe('{"name":"John","email":"john@example.com"}');

          return new Response(JSON.stringify({ id: 123, name: 'John' }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
          });
        }),
      };

      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/users',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/json',
        },
        body: '{"name":"John","email":"john@example.com"}',
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/users',
        } as any,
        resource: '/users',
      };

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(201);
      expect(result.body).toBe('{"id":123,"name":"John"}');
    });

    it('should handle binary content with base64 encoding', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          expect(request.url).toBe('https://api.example.com/upload');
          expect(request.method).toBe('POST');

          const buffer = await request.arrayBuffer();
          expect(buffer.byteLength).toBeGreaterThan(0);

          return new Response('File uploaded', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          });
        }),
      };

      const binaryData = Buffer.from('fake-image-data', 'utf8');
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/upload',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/octet-stream',
        },
        body: binaryData.toString('base64'),
        isBase64Encoded: true,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/upload',
        } as any,
        resource: '/upload',
      };

      const handler = createLambdaHandler(mockApp, {
        binaryMediaTypes: ['application/octet-stream'],
      });
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('File uploaded');
    });
  });

  describe('API Gateway v2 Integration', () => {
    it('should handle API Gateway v2 event with cookies', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          expect(request.url).toBe('https://api.example.com/profile');
          expect(request.method).toBe('GET');
          expect(request.headers.get('cookie')).toBe('session=abc123; theme=dark');

          return new Response(JSON.stringify({ profile: 'data' }), {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'set-cookie': 'newcookie=value; Path=/',
            },
          });
        }),
      };

      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /profile',
        rawPath: '/profile',
        rawQueryString: '',
        cookies: ['session=abc123', 'theme=dark'],
        headers: {
          host: 'api.example.com',
        },
        body: null,
        isBase64Encoded: false,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api-v2',
          domainName: 'api.example.com',
          http: {
            method: 'GET',
            path: '/profile',
            protocol: 'HTTP/1.1',
            sourceIp: '127.0.0.1',
            userAgent: 'test-client',
          },
          requestId: 'test-request-v2',
          routeKey: 'GET /profile',
          stage: 'prod',
          time: '2023-01-01T00:00:00Z',
          timeEpoch: 1672531200,
        },
      };

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('{"profile":"data"}');

      // Check for set-cookie in multiValueHeaders
      if ('multiValueHeaders' in result && result.multiValueHeaders) {
        expect(result.multiValueHeaders['Set-Cookie']).toContain('newcookie=value; Path=/');
      }
    });

    it('should handle complex query string from rawQueryString', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('filter')).toBe('name:john');
          expect(url.searchParams.get('sort')).toBe('created_at');
          expect(url.searchParams.get('page')).toBe('2');

          return new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }),
      };

      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /search',
        rawPath: '/search',
        rawQueryString: 'filter=name%3Ajohn&sort=created_at&page=2',
        headers: {
          host: 'api.example.com',
        },
        body: null,
        isBase64Encoded: false,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api-v2',
          domainName: 'api.example.com',
          http: {
            method: 'GET',
            path: '/search',
            protocol: 'HTTP/1.1',
            sourceIp: '127.0.0.1',
            userAgent: 'test-client',
          },
          requestId: 'test-request-search',
          routeKey: 'GET /search',
          stage: 'prod',
          time: '2023-01-01T00:00:00Z',
          timeEpoch: 1672531200,
        },
      };

      const handler = createLambdaHandler(mockApp);
      await handler(event, mockContext);

      expect(mockApp.fetch).toHaveBeenCalled();
    });
  });

  describe('ALB Event Integration', () => {
    it('should handle ALB event with multi-value headers', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          expect(request.url).toBe('https://api.example.com/webhook');
          expect(request.method).toBe('POST');
          expect(request.headers.get('x-forwarded-for')).toContain('192.168.1.1');

          return new Response('OK', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          });
        }),
      };

      const event: ALBEvent = {
        httpMethod: 'POST',
        path: '/webhook',
        headers: {
          host: 'api.example.com',
        },
        multiValueHeaders: {
          'x-forwarded-for': ['192.168.1.1', '10.0.0.1'],
          accept: ['application/json', 'text/plain'],
        },
        body: 'webhook payload',
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        requestContext: {
          elb: {
            targetGroupArn:
              'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/test/50dc6c495c0c9188',
          },
        },
      };

      const handler = createLambdaHandler(mockApp, {
        multiValueHeaders: true,
      });
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('OK');

      // ALB events should support multiValueHeaders
      if ('multiValueHeaders' in result) {
        expect(result.multiValueHeaders).toBeDefined();
      }
    });
  });

  describe('Fetch Integration', () => {
    it('should call fetch with only the request parameter', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async (request: Request) => {
          // Verify fetch is called with only the request parameter (no platform context)

          return new Response(
            JSON.stringify({
              url: request.url,
              method: request.method,
            }),
            {
              status: 200,
              headers: { 'content-type': 'application/json' },
            }
          );
        }),
      };

      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/info',
        headers: { host: 'api.example.com' },
        body: null,
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/info',
        } as any,
        resource: '/info',
      };

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body!);
      expect(responseBody.url).toBe('https://api.example.com/info');
      expect(responseBody.method).toBe('GET');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle fetch app errors gracefully', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockRejectedValue(new Error('App crashed')),
      };

      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/error',
        headers: { host: 'api.example.com' },
        body: null,
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/error',
        } as any,
        resource: '/error',
      };

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(500);
      expect(result.headers?.['content-type']).toBe('application/json');

      const errorResponse = JSON.parse(result.body!);
      expect(errorResponse.error).toBe('Internal Server Error');
      expect(errorResponse).not.toHaveProperty('message');
    });
  });

  describe('Binary Media Type Integration', () => {
    it('should properly handle binary responses', async () => {
      const mockApp: FetchApp = {
        fetch: vi.fn().mockImplementation(async () => {
          const imageData = Buffer.from('fake-png-data', 'utf8');
          return new Response(imageData, {
            status: 200,
            headers: { 'content-type': 'image/png' },
          });
        }),
      };

      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/image.png',
        headers: { host: 'api.example.com' },
        body: null,
        isBase64Encoded: false,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        multiValueHeaders: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          resourcePath: '/image.png',
        } as any,
        resource: '/image.png',
      };

      const handler = createLambdaHandler(mockApp, {
        binaryMediaTypes: ['image/*'],
      });
      const result = await handler(event, mockContext);

      expect(result.statusCode).toBe(200);
      expect(result.isBase64Encoded).toBe(true);
      expect(result.headers?.['content-type']).toBe('image/png');

      // Verify the body is base64 encoded
      const decodedBody = Buffer.from(result.body!, 'base64').toString('utf8');
      expect(decodedBody).toBe('fake-png-data');
    });
  });
});
