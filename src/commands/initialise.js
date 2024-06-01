'use strict';
const fs = require('fs');
const readline = require('readline');
const {
  GLPM_CONFIG_FILE,
  GLPM_CONFIG_FILE_PATH,
  DEFAULT_API_TIMEOUT,
  PER_PAGE,
  DEFAULT_API_ENDPOINT,
  MESSAGE
} = require('../constants');
const getProjectInput = require('../helpers/get-project-input');

const getConfig = project => {
  return {
    projects: {
      [project.projectId]: project,
      ['default']: project.projectId
    },
    api: {
      defaultApiEndpoint: DEFAULT_API_ENDPOINT,
      timeout: DEFAULT_API_TIMEOUT,
      perPage: PER_PAGE
    }
  };
};

async function run() {
  const readLine = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const prompt = query => new Promise(resolve => readLine.question(query, resolve));

    console.log(`This command will help you in creating the ${GLPM_CONFIG_FILE} file.`);
    console.log(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);

    const input = await getProjectInput(prompt);

    fs.writeFileSync(GLPM_CONFIG_FILE_PATH, JSON.stringify(getConfig(input)), 'utf8');
    console.log('Done!');
  } catch (error) {
    console.error('Init operation failed.', error.message);
  } finally {
    readLine.close();
  }
}

module.exports = run;
