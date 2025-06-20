import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export interface LambdaHandlerOptions {
  binaryMediaTypes?: string[];
}

export interface SvelteKitApp {
  fetch(request: Request, init?: { platform?: any }): Promise<Response>;
}

export function createLambdaHandler(app: SvelteKitApp, options: LambdaHandlerOptions = {}) {
  const { binaryMediaTypes = [] } = options;

  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const host = event.headers.host || event.headers.Host || 'localhost';
    const url = new URL(event.path, `https://${host}`);

    if (event.queryStringParameters) {
      for (const [key, value] of Object.entries(event.queryStringParameters)) {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers: event.headers as Record<string, string>,
      body: event.body
        ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
        : undefined,
    });

    const response = await app.fetch(request, {
      platform: {
        event,
        context,
      },
    });

    const body = await response.text();
    const isBase64Encoded = shouldBase64Encode(response, binaryMediaTypes);

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: isBase64Encoded ? Buffer.from(body).toString('base64') : body,
      isBase64Encoded,
    };
  };
}

function shouldBase64Encode(response: Response, binaryMediaTypes: string[]): boolean {
  const contentType = response.headers.get('content-type') || '';

  return binaryMediaTypes.some(
    (type) =>
      contentType.includes(type) ||
      type === '*/*' ||
      (type.endsWith('/*') && contentType.startsWith(type.slice(0, -2)))
  );
}
