import type { Context } from 'aws-lambda';
import type { LambdaEvent, ResponseConversionOptions } from './converter.js';
import { convertLambdaEventToWebRequest, convertWebResponseToLambdaEvent } from './converter.js';

export interface LambdaHandlerOptions extends ResponseConversionOptions {}

/** Framework-agnostic interface for any fetch-based application */
export interface FetchApp {
  fetch(request: Request): Promise<Response>;
}

/**
 * Creates a Lambda handler that bridges between Lambda events and fetch-based applications.
 * Converts Lambda events to Web Request objects, calls the app's fetch handler,
 * then converts the Web Response back to Lambda's expected format.
 *
 * @param app - Any application that implements the fetch interface
 * @param options - Configuration options for the handler
 * @returns Lambda handler function
 */
export function createLambdaHandler(app: FetchApp, options: LambdaHandlerOptions = {}) {
  return async (event: LambdaEvent, _context: Context) => {
    try {
      // Convert Lambda event to Web Request
      const request = convertLambdaEventToWebRequest(event);

      const response = await app.fetch(request);

      // Convert Web Response back to Lambda response
      const lambdaResponse = await convertWebResponseToLambdaEvent(response, options);

      return lambdaResponse;
    } catch {
      // Return a proper error response
      return {
        statusCode: 500,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
        }),
        isBase64Encoded: false,
      };
    }
  };
}
