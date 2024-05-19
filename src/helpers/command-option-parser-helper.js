'use strict';

module.exports = function commandOptionParserHelper(cmdOptions) {
  return cmdOptions.reduce((result, current) => {
    const [option, value] = current.split('=');
    return { ...result, [option]: value };
  }, {});
};
