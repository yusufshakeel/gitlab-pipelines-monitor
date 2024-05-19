'use strict';
const packageJson = require('../../package.json');
module.exports = function version() {
  console.log(
    `${packageJson.name} - ${packageJson.description}\nversion ${packageJson.version}\n${packageJson.homepage}`
  );
};
