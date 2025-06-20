import { describe, expect, it } from 'vitest';
import {
  isValidHttpMethod,
  normalizeHeaders,
  parseMultiValueHeaders,
  sanitizePath,
} from '../src/utils.js';

describe('normalizeHeaders', () => {
  it('should normalize string headers', () => {
    const headers = { 'content-type': 'application/json' };
    const result = normalizeHeaders(headers);
    expect(result).toEqual({ 'content-type': 'application/json' });
  });

  it('should join array headers with comma', () => {
    const headers = { accept: ['text/html', 'application/json'] };
    const result = normalizeHeaders(headers);
    expect(result).toEqual({ accept: 'text/html, application/json' });
  });

  it('should skip undefined headers', () => {
    const headers = { 'content-type': 'application/json', authorization: undefined };
    const result = normalizeHeaders(headers);
    expect(result).toEqual({ 'content-type': 'application/json' });
  });
});

describe('parseMultiValueHeaders', () => {
  it('should parse comma-separated headers', () => {
    const headers = { accept: 'text/html, application/json' };
    const result = parseMultiValueHeaders(headers);
    expect(result).toEqual({ accept: ['text/html', 'application/json'] });
  });

  it('should keep array headers as arrays', () => {
    const headers = { accept: ['text/html', 'application/json'] };
    const result = parseMultiValueHeaders(headers);
    expect(result).toEqual({ accept: ['text/html', 'application/json'] });
  });
});

describe('isValidHttpMethod', () => {
  it('should return true for valid HTTP methods', () => {
    expect(isValidHttpMethod('GET')).toBe(true);
    expect(isValidHttpMethod('post')).toBe(true);
    expect(isValidHttpMethod('PUT')).toBe(true);
  });

  it('should return false for invalid HTTP methods', () => {
    expect(isValidHttpMethod('INVALID')).toBe(false);
    expect(isValidHttpMethod('')).toBe(false);
  });
});

describe('sanitizePath', () => {
  it('should remove trailing slashes', () => {
    expect(sanitizePath('/path/')).toBe('/path');
    expect(sanitizePath('/path/to/resource/')).toBe('/path/to/resource');
  });

  it('should normalize multiple slashes', () => {
    expect(sanitizePath('//path//to//resource')).toBe('/path/to/resource');
  });

  it('should return / for empty or root paths', () => {
    expect(sanitizePath('')).toBe('/');
    expect(sanitizePath('/')).toBe('/');
  });
});
