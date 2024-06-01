'use strict';
const version = require('../../../../src/commands/version');

describe('version', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('should log the correct version information', () => {
    version();
    expect(console.log).toHaveBeenCalled();
  });
});
