'use strict';

const options = require('../../../../src/commands/options');

describe('options', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('should log command not found when no command is passed', () => {
    options();
    expect(console.log).toHaveBeenCalledWith('\nCommand not found!\n');
  });

  test('should be able show detail when a valid command is passed', () => {
    options({ command: 'version' });
    expect(console.log).not.toHaveBeenCalledWith('\nCommand not found!\n');
  });
});
