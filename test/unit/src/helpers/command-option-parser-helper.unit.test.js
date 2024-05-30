'use strict';

const commandOptionParserHelper = require('../../../../src/helpers/command-option-parser-helper');

describe('commandOptionParserHelper', () => {
  test('Should be able to parser the command option', () => {
    const cmdOptions = ['-name=main', '-key=value'];
    const result = commandOptionParserHelper(cmdOptions);
    expect(result).toStrictEqual({ '-key': 'value', '-name': 'main' });
  });
});
