import type {
  ALBEvent,
  ALBResult,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda';

export type LambdaEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent;

function isAPIGatewayV2Event(event: LambdaEvent): event is APIGatewayProxyEventV2 {
  return 'rawPath' in event;
}

function isALBEvent(event: LambdaEvent): event is ALBEvent {
  return 'requestContext' in event && 'elb' in event.requestContext;
}

function extractHost(event: LambdaEvent): string {
  if (isAPIGatewayV2Event(event)) {
    return event.requestContext.domainName || event.headers?.host || 'localhost';
  }

  if (isALBEvent(event)) {
    return event.headers?.host || event.multiValueHeaders?.host?.[0] || 'localhost';
  }

  return event.requestContext.domainName || event.headers?.host || 'localhost';
}

function extractPath(event: LambdaEvent): string {
  if (isAPIGatewayV2Event(event)) {
    return event.rawPath;
  }

  return event.path;
}

function extractMethod(event: LambdaEvent): string {
  if (isAPIGatewayV2Event(event)) {
    return event.requestContext.http.method;
  }

  return event.httpMethod;
}

function buildQueryString(event: LambdaEvent): string {
  if (isAPIGatewayV2Event(event)) {
    return event.rawQueryString || '';
  }

  if (event.multiValueQueryStringParameters) {
    return Object.entries(event.multiValueQueryStringParameters)
      .filter(([, values]) => values && values.length > 0)
      .flatMap(([key, values]) =>
        values!.map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      )
      .join('&');
  }

  if (event.queryStringParameters) {
    return Object.entries(event.queryStringParameters)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
      .join('&');
  }

  return '';
}

function buildHeaders(event: LambdaEvent): Headers {
  const headers = new Headers();

  if (isAPIGatewayV2Event(event)) {
    if (event.headers) {
      Object.entries(event.headers).forEach(([key, value]) => {
        if (value != null) headers.set(key, value);
      });
    }

    if (event.cookies?.length) {
      headers.set('cookie', event.cookies.join('; '));
    }
  } else {
    // Add regular headers first
    if (event.headers) {
      Object.entries(event.headers).forEach(([key, value]) => {
        if (value != null) headers.set(key, value);
      });
    }

    // Add multi-value headers, avoiding duplicates
    if (event.multiValueHeaders) {
      Object.entries(event.multiValueHeaders).forEach(([key, values]) => {
        if (values?.length) {
          const existing = headers.get(key);
          values.forEach((value) => {
            if (!existing || !existing.includes(value)) {
              headers.append(key, value);
            }
          });
        }
      });
    }
  }

  return headers;
}

function buildBody(event: LambdaEvent): BodyInit | null {
  if (!event.body) return null;

  if (event.isBase64Encoded) {
    return Buffer.from(event.body, 'base64');
  }

  return event.body;
}

export function convertLambdaEventToWebRequest(event: LambdaEvent): Request {
  const host = extractHost(event);
  const path = extractPath(event);
  const method = extractMethod(event);
  const queryString = buildQueryString(event);
  const headers = buildHeaders(event);
  const body = buildBody(event);

  const url = new URL(path, `https://${host}`);

  if (queryString) {
    url.search = queryString;
  }

  return new Request(url, {
    method,
    headers,
    body,
  });
}

export interface ResponseConversionOptions {
  binaryMediaTypes?: string[];
  multiValueHeaders?: boolean;
}

function shouldEncodeAsBase64(response: Response, binaryMediaTypes: string[] = []): boolean {
  const contentType = response.headers.get('content-type') || '';
  const contentEncoding = response.headers.get('content-encoding');

  // Check content encoding first - compressed content is always binary
  if (contentEncoding && /^(gzip|deflate|compress|br)/.test(contentEncoding)) {
    return true;
  }

  // Check explicit binary media types if provided
  if (binaryMediaTypes.length > 0) {
    return binaryMediaTypes.some(
      (type) =>
        contentType.includes(type) ||
        type === '*/*' ||
        // Support wildcard patterns like 'image/*'
        (type.endsWith('/*') && contentType.startsWith(type.slice(0, -2)))
    );
  }

  // Smart default: detect binary content types automatically
  return !/^(text\/(plain|html|css|javascript|csv).*|application\/(.*json|.*xml).*|image\/svg\+xml.*)$/.test(
    contentType
  );
}

// Extended Headers interface for getSetCookie method (newer browsers/runtimes)
interface HeadersWithGetSetCookie extends Headers {
  getSetCookie(): string[];
}

function extractSetCookies(response: Response): string[] {
  if (!response.headers.has('set-cookie')) return [];

  // Use getSetCookie() if available (newer browsers/runtimes)
  if ('getSetCookie' in response.headers && typeof response.headers.getSetCookie === 'function') {
    return (response.headers as HeadersWithGetSetCookie).getSetCookie();
  }

  // Fallback for older implementations - collect all set-cookie values
  const cookies: string[] = [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value);
    }
  });
  return cookies;
}

function convertHeaders(
  response: Response,
  multiValueHeaders = false
): Record<string, string> | Record<string, string[]> {
  if (multiValueHeaders) {
    const headers: Record<string, string[]> = {};
    response.headers.forEach((value, key) => {
      // Skip set-cookie headers as they need special handling
      if (key.toLowerCase() === 'set-cookie') return;

      if (headers[key]) {
        headers[key].push(value);
      } else {
        headers[key] = [value];
      }
    });
    return headers;
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    // Skip set-cookie headers as they need special handling
    if (key.toLowerCase() === 'set-cookie') return;
    headers[key] = value;
  });
  return headers;
}

export async function convertWebResponseToLambdaEvent(
  response: Response,
  options: ResponseConversionOptions = {}
): Promise<APIGatewayProxyResult | ALBResult> {
  const { binaryMediaTypes = [], multiValueHeaders = false } = options;

  const body = await response.text();
  const isBase64Encoded = shouldEncodeAsBase64(response, binaryMediaTypes);
  const cookies = extractSetCookies(response);

  const result = {
    statusCode: response.status,
    body: isBase64Encoded ? Buffer.from(body).toString('base64') : body,
    isBase64Encoded,
  };

  if (multiValueHeaders) {
    const lambdaResult: ALBResult = {
      ...result,
      multiValueHeaders: convertHeaders(response, true) as Record<string, string[]>,
    };

    // Add cookies as multi-value headers for ALB
    if (cookies.length > 0) {
      lambdaResult.multiValueHeaders = {
        ...lambdaResult.multiValueHeaders,
        'Set-Cookie': cookies,
      };
    }

    return lambdaResult;
  }

  const lambdaResult: APIGatewayProxyResult = {
    ...result,
    headers: convertHeaders(response, false) as Record<string, string>,
  };

  // Add cookies for API Gateway (can support multiple cookies)
  if (cookies.length > 0) {
    lambdaResult.multiValueHeaders = {
      'Set-Cookie': cookies,
    };
  }

  return lambdaResult;
}
