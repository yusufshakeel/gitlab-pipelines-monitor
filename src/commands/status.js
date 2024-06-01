'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../constants');
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const { getPipelinesByProjectId, getPipelinesByBranchName } = require('../requests');
const { displayPipelineStatus } = require('../helpers/display-pipeline-status-helper');

module.exports = function Status({ config, commandOptions }) {
  let httpWireLoggingEnabled = commandOptions.hasOwnProperty('-verbose');

  const defaultProject = config.projects[config.projects['default']];
  if (!defaultProject) {
    throw new Error(`[Status] Default Project Id is not set. Run ${GLPM_COMMAND} project --help.`);
  }

  const getStatusAndRender = async selectedProject => {
    const httpClient = HttpClient({
      baseURL: selectedProject.apiEndpoint || config.api.apiEndpoint,
      timeout: config.api.timeout,
      httpWireLoggingEnabled
    });
    const headers = getHeaders(selectedProject);

    const pipelinesRequest = getPipelinesByProjectId({
      httpClient,
      headers,
      config,
      projectId: selectedProject.projectId
    });
    const defaultBranchPipelineRequest = getPipelinesByBranchName({
      httpClient,
      headers,
      projectId: selectedProject.projectId,
      branchName: selectedProject.defaultBranch,
      config: { api: { perPage: 1 } }
    });

    const [pipelinesResponse, defaultBranchPipelineResponse] = await Promise.all([
      pipelinesRequest,
      defaultBranchPipelineRequest
    ]);

    const latestPipelineOfDefaultBranch = defaultBranchPipelineResponse.data.find(
      v => v.ref === selectedProject.defaultBranch
    );
    if (!latestPipelineOfDefaultBranch) {
      throw new Error(`[Status] Default branch ${selectedProject.defaultBranch} not found.`);
    }

    displayPipelineStatus({
      project: selectedProject,
      defaultBranchPipeline:
        defaultBranchPipelineResponse.status === 200 ? latestPipelineOfDefaultBranch : {},
      pipelines: pipelinesResponse.status === 200 ? [...pipelinesResponse.data] : []
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
  };

  return { run };
};
