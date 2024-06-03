'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE, HOME_DIR } = require('../constants');

const introManual = `
  Usage: ${GLPM_COMMAND} --help
  Usage: ${GLPM_COMMAND} command [-option=value]
  Usage: ${GLPM_COMMAND} command --help
  
  Commands:
  =========================================
  version               Print the version.
  init                  Initialise ${GLPM_COMMAND}.
  status                Print the status of pipelines.
  project               Manage projects.
  server                Start the local server.
  
  Configuration file:
  =========================================
  Run the following command to setup configuration file.
  ➜  ${GLPM_COMMAND} init
  
  The init command creates the ${GLPM_CONFIG_FILE} file in the home directory.
  Home Directory: ${HOME_DIR}
`;

const versionCmd = `Version:
➜  ${GLPM_COMMAND} version

This will print the version.
`;

const initCmd = `Initialise:
➜  ${GLPM_COMMAND} init

This will initialise the configuration file.
`;

const statusCmd = `Fetch the status of the pipelines:
➜  ${GLPM_COMMAND} status

This will fetch the status of the default project.
To add the default project, run ${GLPM_COMMAND} project -set-default

  Options
  =========
  To fetch the status of a particular project by its projectId.
  ➜  ${GLPM_COMMAND} status -projectId=<project_id>

    If project is not added in the ${GLPM_CONFIG_FILE} file then run the following command to add
    ${GLPM_COMMAND} project -add

  To fetch the status of a project by its name.
  ➜  ${GLPM_COMMAND} status -name=<project_name>

  Verbose
  ➜  ${GLPM_COMMAND} status -verbose

  Print status in watch mode
  ➜  ${GLPM_COMMAND} status -watch

  Print status in watch mode every N milliseconds
  ➜  ${GLPM_COMMAND} status -watch -interval=10000
`;

const projectCmd = `Manage projects.
➜  ${GLPM_COMMAND} project [-option=value]

  Options
  =========
  List projects
  ➜  ${GLPM_COMMAND} project -list

  Add a default project details
  ➜  ${GLPM_COMMAND} project -set-default

  Add/overwrite project details
  ➜  ${GLPM_COMMAND} project -add

  Remove project details
  ➜  ${GLPM_COMMAND} project -remove
`;

const serverCmd = `Run the local server.
➜  ${GLPM_COMMAND} server
`;

const optionsMap = {
  ['intro-manual']: introManual,
  version: versionCmd,
  init: initCmd,
  status: statusCmd,
  project: projectCmd,
  server: serverCmd
};

module.exports = function options(params) {
  console.log(optionsMap[params?.command] ?? '\nCommand not found!\n');
};
