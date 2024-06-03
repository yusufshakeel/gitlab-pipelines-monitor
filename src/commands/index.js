'use strict';

const options = require('./options');
const version = require('./version');
const initialise = require('./initialise');
const status = require('./status');
const project = require('./project');
const {
  GLPM_COMMAND,
  DEFAULT_API_TIMEOUT,
  PER_PAGE,
  DEFAULT_API_ENDPOINT,
  CHECK_STATUS_EVERY_N_MILLISECONDS
} = require('../constants');
const getConfigFile = require('../helpers/get-config-file');
const commandOptionParserHelper = require('../helpers/command-option-parser-helper');

const commandHandlerConfig = ({ config, commandOptions }) => ({
  version: () => version(),
  init: () => initialise(),
  status: () => status({ config, commandOptions }).run(),
  project: () => project({ config, commandOptions }).run(),
  server: () => require('../server')
});

module.exports = async function commands(argv) {
  try {
    if (argv[0] === 'init') {
      await initialise();
      return;
    }

    const [command] = argv;

    if (!argv.length || argv[0] === '--help' || argv[1] === '--help') {
      const params = argv.length > 1 ? { command: argv[0] } : { command: 'intro-manual' };
      options(params);
      return;
    }

    const configFileContent = getConfigFile();
    const config = {
      ...configFileContent,
      api: {
        apiEndpoint: DEFAULT_API_ENDPOINT,
        timeout: DEFAULT_API_TIMEOUT,
        perPage: PER_PAGE,
        ...configFileContent?.api
      },
      watchModeInterval: CHECK_STATUS_EVERY_N_MILLISECONDS
    };

    try {
      const commandOptions = commandOptionParserHelper(argv);
      const cmdHandler = commandHandlerConfig({ config, commandOptions })[command];
      if (cmdHandler) {
        await cmdHandler();
      } else {
        console.log(`\nCommand not Found\n\nTry\n➜  ${GLPM_COMMAND} --help\n`);
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
};
