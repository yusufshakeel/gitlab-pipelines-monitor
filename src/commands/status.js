'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../constants');
const { displayPipelineStatus } = require('../helpers/display-pipeline-status-helper');
const { formateDateTime } = require('../helpers/datetime-helper');
const ProjectService = require('../services/project-service');

module.exports = function Status({ config, commandOptions }) {
  const httpWireLoggingEnabled = '-verbose' in commandOptions;
  const watchModeEnabled = '-watch' in commandOptions;
  const watchModeInterval = parseInt(commandOptions['-interval'] || config.watchModeInterval, 10);

  const defaultProject = config.projects[config.projects['default']];
  if (!defaultProject) {
    throw new Error(`[Status] Default Project Id is not set. Run ${GLPM_COMMAND} project --help.`);
  }

  const projectService = ProjectService({ config: { ...config, httpWireLoggingEnabled } });

  const getStatusAndRender = async selectedProject => {
    const result = await projectService.getStatuses(selectedProject.projectId);
    watchModeEnabled && watchModeInterval && console.clear();
    displayPipelineStatus({
      project: selectedProject,
      defaultBranchPipeline: result.defaultBranchPipeline,
      pipelines: result.pipelines
    });
  };

  const getStatus = async () => {
    const projectIdFromCommandOptions = commandOptions['-projectId'];
    const selectedProject = projectIdFromCommandOptions?.length
      ? config.projects[projectIdFromCommandOptions]
      : defaultProject;
    if (projectIdFromCommandOptions && !selectedProject) {
      throw new Error(
        `[Status] Project Id ${projectIdFromCommandOptions} is not added. ` +
          `Run ${GLPM_COMMAND} project --help to check how to add new projects.`
      );
    }
    await getStatusAndRender(selectedProject);
  };

  const getStatusByProjectName = async () => {
    const projectNameFromCommandOptions = commandOptions['-name'];
    if (!projectNameFromCommandOptions) {
      throw new Error('[Status] Project name missing.');
    }
    const firstMatchingProject = Object.values(config.projects).find(v =>
      v.projectName?.includes(projectNameFromCommandOptions)
    );
    if (projectNameFromCommandOptions && !firstMatchingProject) {
      throw new Error(
        `[Status] No project found by the name ${projectNameFromCommandOptions} in ${GLPM_CONFIG_FILE} file.`
      );
    }
    await getStatusAndRender(firstMatchingProject);
  };

  const run = async () => {
    const commandMap = {
      '-name': () => getStatusByProjectName(),
      '-projectId': () => getStatus(),
      ['default']: () => getStatus()
    };
    const actions = Object.keys(commandMap);
    const matchingCommandAction =
      Object.keys(commandOptions).find(v => actions.includes(v)) || 'default';
    await commandMap[matchingCommandAction]();
    watchModeEnabled &&
      setInterval(async () => {
        await commandMap[matchingCommandAction]();
        console.log(`\nLast fetched at: ${formateDateTime(new Date())}`);
      }, watchModeInterval);
  };

  return { run };
};
