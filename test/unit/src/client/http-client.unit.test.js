'use strict';
const axios = require('axios');
const HttpClient = require('../../../../src/client/http-client');

jest.mock('axios');

describe('HttpClient', () => {
  let httpClient;
  const baseURL = 'http://example.com';
  const timeout = 5000;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('should log the baseURL and timeout', () => {
    axios.create.mockReturnValue({
      get: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    });
    HttpClient({ baseURL, timeout, httpWireLoggingEnabled: true });
    expect(axios.create).toHaveBeenCalledWith({ baseURL, timeout });
    expect(console.log).toHaveBeenCalledWith('[HTTP Client] baseURL:', baseURL);
    expect(console.log).toHaveBeenCalledWith('[HTTP Client] timeout (milliseconds):', timeout);
  });

  test('should make a GET request and return data on success', async () => {
    jest.useFakeTimers();
    const mockResponse = {
      status: 200,
      data: { message: 'success' },
      config: { method: 'get', baseURL, url: '/test' }
    };
    const mockGet = jest.fn().mockResolvedValue(mockResponse);
    axios.CancelToken = { source: jest.fn(() => ({ token: 'token', cancel: jest.fn() })) };
    axios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    });
    httpClient = HttpClient({ baseURL, timeout, httpWireLoggingEnabled: true });

    const promise = httpClient.get({ url: '/test', headers: {} });

    jest.runAllTimers();

    const result = await promise;

    expect(mockGet).toHaveBeenCalledWith('/test', { cancelToken: 'token' });
    expect(result).toEqual(mockResponse);
  });

  test('should log error if GET request fails', async () => {
    jest.useFakeTimers();
    const errorMessage = 'Network Error';
    const mockGet = jest.fn().mockRejectedValue(new Error(errorMessage));
    axios.CancelToken = { source: jest.fn(() => ({ token: 'token', cancel: jest.fn() })) };
    axios.create.mockReturnValue({
      get: mockGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    });

    httpClient = HttpClient({ baseURL, timeout, httpWireLoggingEnabled: true });

    const promise = httpClient.get({ url: '/test', headers: {} });

    jest.runAllTimers();

    const result = await promise;

    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith('[HTTP Client] Error GET /test: Network Error');
  });
});
