// Core converter functions and utilities (framework-agnostic)

// Converter types and functions
export type {
  LambdaEvent,
  ResponseConversionOptions,
} from './converter.js';
export {
  convertLambdaEventToWebRequest,
  convertWebResponseToLambdaEvent,
} from './converter.js';

// Handler utilities
export type {
  FetchApp,
  LambdaHandlerOptions,
} from './handler.js';
export { createLambdaHandler } from './handler.js';

// Utility functions
export {
  isValidHttpMethod,
  normalizeHeaders,
  parseMultiValueHeaders,
  sanitizePath,
} from './utils.js';
