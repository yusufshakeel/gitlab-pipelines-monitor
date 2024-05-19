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
To add the default project, run ${GLPM_COMMAND} project -add-default

  Options
  =========
  To fetch the status of a particular project.
  ➜  ${GLPM_COMMAND} status -projectId=<project_id>

  If project is not added in the ${GLPM_CONFIG_FILE} file then run the following command to add
  ${GLPM_COMMAND} project -add-project
`;

const projectCmd = `Manage projects.
➜  ${GLPM_COMMAND} project [-option=value]

  Options
  =========
  List projects
  ➜  ${GLPM_COMMAND} project -list

  Add a default project details
  ➜  ${GLPM_COMMAND} project -add-default

  Add/overwrite project details
  ➜  ${GLPM_COMMAND} project -add-project

  Remove project details
  ➜  ${GLPM_COMMAND} project -remove-project
`;

const optionsMap = {
  ['intro-manual']: introManual,
  version: versionCmd,
  init: initCmd,
  status: statusCmd,
  project: projectCmd
};

module.exports = function options(params = {}) {
  console.log(optionsMap[params.command] ?? '\nCommand not found!\n');
};
