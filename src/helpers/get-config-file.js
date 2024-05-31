'use strict';

const fs = require('fs');
const { GLPM_COMMAND, GLPM_CONFIG_FILE, GLPM_CONFIG_FILE_PATH } = require('../constants');

module.exports = function getConfigFile() {
  const fileExists = fs.existsSync(GLPM_CONFIG_FILE_PATH);
  if (!fileExists) {
    throw new Error(
      `${GLPM_CONFIG_FILE} file is not yet set. Run "${GLPM_COMMAND} init" command to configure.`
    );
  }

  try {
    const fileContent = fs.readFileSync(GLPM_CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    throw new Error(`Failed to read ${GLPM_CONFIG_FILE_PATH} file. ${e.message}`);
  }
};
