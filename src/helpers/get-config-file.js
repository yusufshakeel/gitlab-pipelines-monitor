'use strict';

const fs = require('fs');
const { GLPM_COMMAND, GLPM_CONFIG_FILE, GLPM_CONFIG_FILE_PATH } = require('../constants');

module.exports = function getConfigFile() {
  try {
    const fileExists = fs.existsSync(GLPM_CONFIG_FILE_PATH);
    if (!fileExists) {
      console.info(
        `[INFO] ${GLPM_CONFIG_FILE} file is not yet set. Run "${GLPM_COMMAND} init" command to configure.`
      );
      return;
    }

    const fileContent = fs.readFileSync(GLPM_CONFIG_FILE_PATH, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.log(`ERROR. Failed to read ${GLPM_CONFIG_FILE_PATH} file:`, e.message);
    throw e;
  }
};
