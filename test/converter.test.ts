import type { ALBEvent, APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { convertLambdaEventToWebRequest, convertWebResponseToLambdaEvent } from '../src/converter';

describe('convertLambdaEventToWebRequest', () => {
  describe('API Gateway v1 events', () => {
    it('should convert basic API Gateway v1 event', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          accountId: '123456789',
          apiId: 'test-api',
          protocol: 'HTTP/1.1',
          httpMethod: 'GET',
          path: '/test',
          stage: 'prod',
          requestId: 'test-request',
          requestTime: '2023-01-01T00:00:00Z',
          requestTimeEpoch: 1672531200,
          identity: {
            sourceIp: '127.0.0.1',
            userAgent: 'test-agent',
          },
          domainName: 'api.example.com',
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://api.example.com/test');
      expect(request.method).toBe('GET');
      expect(request.headers.get('host')).toBe('api.example.com');
      expect(request.headers.get('content-type')).toBe('application/json');
    });

    it('should handle query parameters correctly', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/search',
        headers: { host: 'api.example.com' },
        multiValueHeaders: {},
        queryStringParameters: {
          q: 'test query',
          limit: '10',
        },
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/search',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://api.example.com/search?q=test%20query&limit=10');
    });

    it('should handle multi-value query parameters', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/filter',
        headers: { host: 'api.example.com' },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: {
          tags: ['javascript', 'typescript'],
          categories: ['web', 'backend'],
        },
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/filter',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe(
        'https://api.example.com/filter?tags=javascript&tags=typescript&categories=web&categories=backend'
      );
    });

    it('should handle multi-value headers', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/api',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/json',
        },
        multiValueHeaders: {
          'x-forwarded-for': ['192.168.1.1', '10.0.0.1'],
          accept: ['application/json', 'text/plain'],
        },
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: '{"test": true}',
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/api',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.headers.get('x-forwarded-for')).toBe('192.168.1.1, 10.0.0.1');
      expect(request.headers.get('accept')).toBe('application/json, text/plain');
    });

    it('should handle POST request with body', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/users',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/json',
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: '{"name": "John Doe", "email": "john@example.com"}',
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/users',
      };

      const request = convertLambdaEventToWebRequest(event);
      const body = await request.text();

      expect(request.method).toBe('POST');
      expect(body).toBe('{"name": "John Doe", "email": "john@example.com"}');
    });

    it('should handle base64 encoded body', async () => {
      const originalData = 'binary data content';
      const base64Data = Buffer.from(originalData).toString('base64');

      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/upload',
        headers: {
          host: 'api.example.com',
          'content-type': 'application/octet-stream',
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: base64Data,
        isBase64Encoded: true,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/upload',
      };

      const request = convertLambdaEventToWebRequest(event);
      const arrayBuffer = await request.arrayBuffer();
      const decoded = Buffer.from(arrayBuffer).toString();

      expect(decoded).toBe(originalData);
    });
  });

  describe('API Gateway v2 events', () => {
    it('should convert basic API Gateway v2 event', () => {
      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /test',
        rawPath: '/test',
        rawQueryString: '',
        headers: {
          host: 'api.example.com',
          'user-agent': 'test-agent',
        },
        cookies: [],
        body: null,
        isBase64Encoded: false,
        requestContext: {
          accountId: '123456789',
          apiId: 'test-api',
          domainName: 'api.example.com',
          http: {
            method: 'GET',
            path: '/test',
            protocol: 'HTTP/1.1',
            sourceIp: '127.0.0.1',
            userAgent: 'test-agent',
          },
          requestId: 'test-request',
          routeKey: 'GET /test',
          stage: 'prod',
          time: '2023-01-01T00:00:00Z',
          timeEpoch: 1672531200,
        } as any,
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://api.example.com/test');
      expect(request.method).toBe('GET');
      expect(request.headers.get('host')).toBe('api.example.com');
    });

    it('should handle raw query string', () => {
      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /search',
        rawPath: '/search',
        rawQueryString: 'q=test%20query&limit=10',
        headers: { host: 'api.example.com' },
        cookies: [],
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
          http: { method: 'GET' },
        } as any,
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://api.example.com/search?q=test%20query&limit=10');
    });

    it('should handle cookies', () => {
      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /profile',
        rawPath: '/profile',
        rawQueryString: '',
        headers: { host: 'api.example.com' },
        cookies: ['session=abc123', 'theme=dark'],
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
          http: { method: 'GET' },
        } as any,
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.headers.get('cookie')).toBe('session=abc123; theme=dark');
    });
  });

  describe('ALB events', () => {
    it('should convert basic ALB event', () => {
      const event: ALBEvent = {
        httpMethod: 'GET',
        path: '/health',
        headers: {
          host: 'alb.example.com',
          'user-agent': 'ALB-HealthChecker/2.0',
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          elb: {
            targetGroupArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/test/123',
          },
        },
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://alb.example.com/health');
      expect(request.method).toBe('GET');
      expect(request.headers.get('host')).toBe('alb.example.com');
    });

    it('should handle ALB multi-value headers', () => {
      const event: ALBEvent = {
        httpMethod: 'GET',
        path: '/test',
        headers: {},
        multiValueHeaders: {
          host: ['alb.example.com'],
          'x-forwarded-for': ['192.168.1.1', '10.0.0.1'],
          accept: ['text/html', 'application/json'],
        },
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          elb: {
            targetGroupArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/test/123',
          },
        },
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://alb.example.com/test');
      expect(request.headers.get('host')).toBe('alb.example.com');
      expect(request.headers.get('x-forwarded-for')).toBe('192.168.1.1, 10.0.0.1');
      expect(request.headers.get('accept')).toBe('text/html, application/json');
    });
  });

  describe('edge cases', () => {
    it('should handle missing host gracefully', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {} as any,
        resource: '/test',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://localhost/test');
    });

    it('should handle empty query parameters', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        headers: { host: 'api.example.com' },
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/test',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.url).toBe('https://api.example.com/test');
    });

    it('should handle null and undefined header values', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
        headers: {
          host: 'api.example.com',
          'x-empty': '',
          'x-null': null as any,
          'x-undefined': undefined as any,
          'x-valid': 'value',
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        body: null,
        isBase64Encoded: false,
        requestContext: {
          domainName: 'api.example.com',
        } as any,
        resource: '/test',
      };

      const request = convertLambdaEventToWebRequest(event);

      expect(request.headers.get('x-empty')).toBe(''); // Empty string should be preserved
      expect(request.headers.get('x-null')).toBeNull();
      expect(request.headers.get('x-undefined')).toBeNull();
      expect(request.headers.get('x-valid')).toBe('value');
    });
  });
});

describe('convertWebResponseToLambdaEvent', () => {
  describe('Basic response conversion', () => {
    it('should convert basic text response', async () => {
      const response = new Response('Hello World', {
        status: 200,
        headers: {
          'content-type': 'text/plain',
          'x-custom': 'test-value',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('Hello World');
      expect(result.isBase64Encoded).toBe(false);
      expect(result.headers).toEqual({
        'content-type': 'text/plain',
        'x-custom': 'test-value',
      });
    });

    it('should convert JSON response', async () => {
      const data = { message: 'Hello', count: 42 };
      const response = new Response(JSON.stringify(data), {
        status: 201,
        headers: {
          'content-type': 'application/json',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(201);
      expect(result.body).toBe(JSON.stringify(data));
      expect(result.isBase64Encoded).toBe(false);
      expect(result.headers).toEqual({
        'content-type': 'application/json',
      });
    });

    it('should preserve various status codes', async () => {
      const testCases = [200, 201, 400, 404, 500];

      for (const status of testCases) {
        const response = new Response('test', { status });
        const result = await convertWebResponseToLambdaEvent(response);
        expect(result.statusCode).toBe(status);
      }
    });

    it('should handle empty response body', async () => {
      const response = new Response('', {
        headers: { 'content-type': 'text/plain' },
      });
      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('');
      expect(result.isBase64Encoded).toBe(false);
    });
  });

  describe('Binary content detection', () => {
    it('should detect image content as binary', async () => {
      const response = new Response('fake-image-data', {
        headers: { 'content-type': 'image/png' },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.isBase64Encoded).toBe(true);
      expect(result.body).toBe(Buffer.from('fake-image-data').toString('base64'));
    });

    it('should detect various binary content types', async () => {
      const binaryTypes = [
        'image/jpeg',
        'image/gif',
        'application/pdf',
        'application/octet-stream',
        'audio/mpeg',
        'video/mp4',
        'font/woff2',
      ];

      for (const contentType of binaryTypes) {
        const response = new Response('binary-data', {
          headers: { 'content-type': contentType },
        });

        const result = await convertWebResponseToLambdaEvent(response);
        expect(result.isBase64Encoded).toBe(true);
      }
    });

    it('should handle text content as non-binary', async () => {
      const textTypes = [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'text/csv',
        'application/json',
        'application/xml',
        'application/rss+xml',
        'image/svg+xml',
      ];

      for (const contentType of textTypes) {
        const response = new Response('text-data', {
          headers: { 'content-type': contentType },
        });

        const result = await convertWebResponseToLambdaEvent(response);
        expect(result.isBase64Encoded).toBe(false);
      }
    });

    it('should detect compressed content as binary', async () => {
      const compressionTypes = ['gzip', 'deflate', 'compress', 'br'];

      for (const encoding of compressionTypes) {
        const response = new Response('compressed-text', {
          headers: {
            'content-type': 'text/plain',
            'content-encoding': encoding,
          },
        });

        const result = await convertWebResponseToLambdaEvent(response);
        expect(result.isBase64Encoded).toBe(true);
      }
    });

    it('should handle content-type with charset parameters', async () => {
      const response = new Response('text with charset', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });

      const result = await convertWebResponseToLambdaEvent(response);
      expect(result.isBase64Encoded).toBe(false);
    });

    it('should handle missing content-type header', async () => {
      const response = new Response('no content type');
      const result = await convertWebResponseToLambdaEvent(response);
      expect(result.isBase64Encoded).toBe(false);
    });
  });

  describe('Custom binary media types', () => {
    it('should respect explicit binary media types', async () => {
      const response = new Response('custom-data', {
        headers: { 'content-type': 'application/custom' },
      });

      const result = await convertWebResponseToLambdaEvent(response, {
        binaryMediaTypes: ['application/custom'],
      });

      expect(result.isBase64Encoded).toBe(true);
    });

    it('should handle wildcard binary media types', async () => {
      const response = new Response('any-application-data', {
        headers: { 'content-type': 'application/special-format' },
      });

      const result = await convertWebResponseToLambdaEvent(response, {
        binaryMediaTypes: ['application/*'],
      });

      expect(result.isBase64Encoded).toBe(true);
    });

    it('should handle */* wildcard', async () => {
      const response = new Response('any-data', {
        headers: { 'content-type': 'text/plain' },
      });

      const result = await convertWebResponseToLambdaEvent(response, {
        binaryMediaTypes: ['*/*'],
      });

      expect(result.isBase64Encoded).toBe(true);
    });

    it('should prioritize content-encoding over explicit binary types', async () => {
      const response = new Response('compressed-text', {
        headers: {
          'content-type': 'text/plain',
          'content-encoding': 'gzip',
        },
      });

      // Even though text/plain is not in binaryMediaTypes, gzip encoding makes it binary
      const result = await convertWebResponseToLambdaEvent(response, {
        binaryMediaTypes: ['image/*'],
      });

      expect(result.isBase64Encoded).toBe(true);
    });
  });

  describe('Cookie handling', () => {
    it('should handle single set-cookie header for API Gateway', async () => {
      const response = new Response('OK');
      response.headers.set('set-cookie', 'session=abc123; HttpOnly');

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.multiValueHeaders?.['Set-Cookie']).toEqual(['session=abc123; HttpOnly']);
      expect(result.headers).not.toHaveProperty('set-cookie');
    });

    it('should handle multiple set-cookie headers for API Gateway', async () => {
      const response = new Response('OK');
      response.headers.append('set-cookie', 'session=abc123; HttpOnly');
      response.headers.append('set-cookie', 'theme=dark; Path=/');
      response.headers.append('set-cookie', 'lang=en; Domain=.example.com');

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.multiValueHeaders?.['Set-Cookie']).toEqual([
        'session=abc123; HttpOnly',
        'theme=dark; Path=/',
        'lang=en; Domain=.example.com',
      ]);
    });

    it('should handle cookies with ALB multi-value headers format', async () => {
      const response = new Response('OK');
      response.headers.append('set-cookie', 'session=abc123');
      response.headers.append('set-cookie', 'theme=dark');

      const result = await convertWebResponseToLambdaEvent(response, {
        multiValueHeaders: true,
      });

      expect(result.multiValueHeaders?.['Set-Cookie']).toEqual(['session=abc123', 'theme=dark']);
    });

    it('should not include set-cookie in regular headers', async () => {
      const response = new Response('OK', {
        headers: {
          'content-type': 'text/plain',
          'set-cookie': 'session=abc123',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.headers).toEqual({
        'content-type': 'text/plain',
      });
      expect(result.multiValueHeaders?.['Set-Cookie']).toEqual(['session=abc123']);
    });

    it('should handle response without cookies', async () => {
      const response = new Response('OK', {
        headers: { 'content-type': 'text/plain' },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.multiValueHeaders).toBeUndefined();
      expect(result.headers).toEqual({
        'content-type': 'text/plain',
      });
    });
  });

  describe('Header conversion modes', () => {
    it('should convert headers to single-value format by default', async () => {
      const response = new Response('OK', {
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'value1',
          'cache-control': 'no-cache',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'x-custom-header': 'value1',
        'cache-control': 'no-cache',
      });
      expect(result).not.toHaveProperty('multiValueHeaders');
    });

    it('should convert headers to multi-value format when requested', async () => {
      const response = new Response('OK', {
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'value1',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response, {
        multiValueHeaders: true,
      });

      expect(result.multiValueHeaders).toEqual({
        'content-type': ['application/json'],
        'x-custom-header': ['value1'],
      });
      expect(result).not.toHaveProperty('headers');
    });

    it('should handle headers with multiple values in multi-value mode', async () => {
      const response = new Response('OK', {
        headers: { 'content-type': 'text/plain' },
      });
      response.headers.append('x-multi', 'value1');
      response.headers.append('x-multi', 'value2');
      response.headers.set('x-single', 'single-value');

      const result = await convertWebResponseToLambdaEvent(response, {
        multiValueHeaders: true,
      });

      // The Headers API joins multiple values with comma, so we get the joined string
      expect(result.multiValueHeaders).toEqual({
        'content-type': ['text/plain'],
        'x-multi': ['value1, value2'], // Headers API behavior
        'x-single': ['single-value'],
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle very large response bodies', async () => {
      const largeContent = 'x'.repeat(100000);
      const response = new Response(largeContent, {
        headers: { 'content-type': 'text/plain' },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.body).toBe(largeContent);
      expect(result.isBase64Encoded).toBe(false);
    });

    it('should handle special characters in response body', async () => {
      const specialContent = 'Hello 世界 🌍 émojis & spéciál chârs';
      const response = new Response(specialContent, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.body).toBe(specialContent);
      expect(result.isBase64Encoded).toBe(false);
    });

    it('should handle headers with empty values', async () => {
      const response = new Response('OK', {
        headers: {
          'content-type': 'text/plain',
          'x-empty': '',
          'x-normal': 'value',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.headers).toEqual({
        'content-type': 'text/plain',
        'x-empty': '',
        'x-normal': 'value',
      });
    });

    it('should handle case-insensitive header names', async () => {
      const response = new Response('OK');
      response.headers.set('Content-Type', 'text/plain');
      response.headers.set('X-Custom-Header', 'value');

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.headers).toHaveProperty('content-type', 'text/plain');
      expect(result.headers).toHaveProperty('x-custom-header', 'value');
    });

    it('should combine binary detection strategies correctly', async () => {
      // Test case where content-type suggests text but content-encoding suggests binary
      const response = new Response('compressed text', {
        headers: {
          'content-type': 'text/plain',
          'content-encoding': 'gzip',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response, {
        binaryMediaTypes: ['image/*'], // doesn't match content-type
      });

      // Should be binary due to content-encoding, not content-type or binaryMediaTypes
      expect(result.isBase64Encoded).toBe(true);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical HTML response', async () => {
      const htmlContent = '<!DOCTYPE html><html><body>Hello World</body></html>';
      const response = new Response(htmlContent, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600',
          etag: '"abc123"',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe(htmlContent);
      expect(result.isBase64Encoded).toBe(false);
      expect(result.headers).toEqual({
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        etag: '"abc123"',
      });
    });

    it('should handle API error response with JSON', async () => {
      const errorResponse = { error: 'Not Found', code: 404 };
      const response = new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: {
          'content-type': 'application/json',
          'x-error-id': 'err_123',
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(404);
      expect(result.body).toBe(JSON.stringify(errorResponse));
      expect(result.isBase64Encoded).toBe(false);
    });

    it('should handle file download response', async () => {
      const binaryData = 'fake-pdf-content';
      const response = new Response(binaryData, {
        status: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="document.pdf"',
          'content-length': binaryData.length.toString(),
        },
      });

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(200);
      expect(result.isBase64Encoded).toBe(true);
      expect(result.body).toBe(Buffer.from(binaryData).toString('base64'));
      expect(result.headers).toEqual({
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="document.pdf"',
        'content-length': binaryData.length.toString(),
      });
    });

    it('should handle SvelteKit SSR response with cookies and headers', async () => {
      const htmlContent = '<html><body>SvelteKit App</body></html>';
      const response = new Response(htmlContent, {
        status: 200,
        headers: {
          'content-type': 'text/html',
          'set-cookie': 'sveltekit-session=abc123; HttpOnly; Path=/',
        },
      });
      response.headers.append('set-cookie', 'theme=dark; Path=/; Max-Age=31536000');

      const result = await convertWebResponseToLambdaEvent(response);

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe(htmlContent);
      expect(result.isBase64Encoded).toBe(false);
      expect(result.headers).toEqual({
        'content-type': 'text/html',
      });
      expect(result.multiValueHeaders?.['Set-Cookie']).toEqual([
        'sveltekit-session=abc123; HttpOnly; Path=/',
        'theme=dark; Path=/; Max-Age=31536000',
      ]);
    });
  });
});
