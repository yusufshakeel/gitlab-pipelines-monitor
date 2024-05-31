'use strict';

const { getHeaders } = require('../../../../src/helpers/http-request-headers');

describe('http request headers', () => {
  describe('getHeaders', () => {
    test('Should return the PRIVATE-TOKEN when provided', () => {
      expect(getHeaders({ personalAccessToken: '1234' })).toStrictEqual({
        'PRIVATE-TOKEN': '1234'
      });
    });

    test('Should return empty headers when PRIVATE-TOKEN is not provided', () => {
      expect(getHeaders({})).toStrictEqual({});
    });
  });
});
