import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FetchApp, LambdaHandlerOptions } from '../src/handler.js';
import { createLambdaHandler } from '../src/handler.js';

// Mock the converter functions
vi.mock('../src/converter.js', () => ({
  convertLambdaEventToWebRequest: vi.fn(),
  convertWebResponseToLambdaEvent: vi.fn(),
}));

import {
  convertLambdaEventToWebRequest,
  convertWebResponseToLambdaEvent,
} from '../src/converter.js';

const mockConvertLambdaEventToWebRequest = vi.mocked(convertLambdaEventToWebRequest);
const mockConvertWebResponseToLambdaEvent = vi.mocked(convertWebResponseToLambdaEvent);

describe('createLambdaHandler', () => {
  let mockApp: FetchApp;
  let mockContext: Context;
  beforeEach(() => {
    vi.clearAllMocks();

    mockApp = {
      fetch: vi.fn(),
    };

    mockContext = {
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
  });

  describe('successful request processing', () => {
    it('should process API Gateway v1 event successfully', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
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
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const mockRequest = new Request('https://api.example.com/test');
      const mockResponse = new Response('Hello World', { status: 200 });
      const mockLambdaResponse = {
        statusCode: 200,
        headers: { 'content-type': 'text/plain' },
        body: 'Hello World',
        isBase64Encoded: false,
      };

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockResolvedValue(mockResponse);
      mockConvertWebResponseToLambdaEvent.mockResolvedValue(mockLambdaResponse);

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(mockConvertLambdaEventToWebRequest).toHaveBeenCalledWith(event);
      expect(mockApp.fetch).toHaveBeenCalledWith(mockRequest);
      expect(mockConvertWebResponseToLambdaEvent).toHaveBeenCalledWith(mockResponse, {});
      expect(result).toEqual(mockLambdaResponse);
    });

    it('should process API Gateway v2 event successfully', async () => {
      const event: APIGatewayProxyEventV2 = {
        version: '2.0',
        routeKey: 'GET /test',
        rawPath: '/test',
        rawQueryString: '',
        headers: { host: 'api.example.com' },
        body: null,
        isBase64Encoded: false,
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          domainName: 'api.example.com',
          http: {
            method: 'GET',
            path: '/test',
            protocol: 'HTTP/1.1',
            sourceIp: '127.0.0.1',
            userAgent: 'test',
          },
          requestId: 'test-request',
          routeKey: 'GET /test',
          stage: 'prod',
          time: '2023-01-01T00:00:00Z',
          timeEpoch: 1672531200,
        },
      };

      const mockRequest = new Request('https://api.example.com/test');
      const mockResponse = new Response(JSON.stringify({ message: 'success' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      const mockLambdaResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: '{"message":"success"}',
        isBase64Encoded: false,
      };

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockResolvedValue(mockResponse);
      mockConvertWebResponseToLambdaEvent.mockResolvedValue(mockLambdaResponse);

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result).toEqual(mockLambdaResponse);
    });

    it('should pass through handler options to converter', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
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
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const options: LambdaHandlerOptions = {
        binaryMediaTypes: ['image/*'],
        multiValueHeaders: true,
      };

      const mockRequest = new Request('https://api.example.com/test');
      const mockResponse = new Response('Hello World');
      const mockLambdaResponse = {
        statusCode: 200,
        multiValueHeaders: { 'content-type': ['text/plain'] },
        body: 'Hello World',
        isBase64Encoded: false,
      };

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockResolvedValue(mockResponse);
      mockConvertWebResponseToLambdaEvent.mockResolvedValue(mockLambdaResponse);

      const handler = createLambdaHandler(mockApp, options);
      await handler(event, mockContext);

      expect(mockConvertWebResponseToLambdaEvent).toHaveBeenCalledWith(mockResponse, {
        binaryMediaTypes: ['image/*'],
        multiValueHeaders: true,
      });
    });
  });


  describe('error handling', () => {
    it('should handle converter errors and return 500 response', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
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
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const error = new Error('Converter failed');
      mockConvertLambdaEventToWebRequest.mockImplementation(() => {
        throw error;
      });

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result).toEqual({
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
        isBase64Encoded: false,
      });
    });

    it('should handle fetch app errors and return 500 response', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
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
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const mockRequest = new Request('https://api.example.com/test');
      const error = new Error('App crashed');

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockRejectedValue(error);

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result).toEqual({
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
        isBase64Encoded: false,
      });
    });


    it('should handle response conversion errors', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
        path: '/test',
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
          resourcePath: '/test',
        } as any,
        resource: '/test',
      };

      const mockRequest = new Request('https://api.example.com/test');
      const mockResponse = new Response('Hello');
      const error = new Error('Response conversion failed');

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockResolvedValue(mockResponse);
      mockConvertWebResponseToLambdaEvent.mockRejectedValue(error);

      const handler = createLambdaHandler(mockApp);
      const result = await handler(event, mockContext);

      expect(result).toEqual({
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
        isBase64Encoded: false,
      });
    });
  });

  describe('fetch method calls', () => {
    it('should call fetch with only the request parameter', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        path: '/api/data',
        headers: { host: 'api.example.com', 'content-type': 'application/json' },
        body: '{"test":"data"}',
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
          resourcePath: '/api/data',
        } as any,
        resource: '/api/data',
      };

      const mockRequest = new Request('https://api.example.com/api/data', {
        method: 'POST',
        body: '{"test":"data"}',
      });
      const mockResponse = new Response('{"result":"success"}');
      const mockLambdaResponse = {
        statusCode: 200,
        headers: {},
        body: '{"result":"success"}',
        isBase64Encoded: false,
      };

      mockConvertLambdaEventToWebRequest.mockReturnValue(mockRequest);
      vi.mocked(mockApp.fetch).mockResolvedValue(mockResponse);
      mockConvertWebResponseToLambdaEvent.mockResolvedValue(mockLambdaResponse);

      const handler = createLambdaHandler(mockApp);
      await handler(event, mockContext);

      expect(mockApp.fetch).toHaveBeenCalledWith(mockRequest);
    });
  });
});
