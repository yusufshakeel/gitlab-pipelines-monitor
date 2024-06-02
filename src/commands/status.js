'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../constants');
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const {
  getPipelinesByProjectId,
  getPipelinesByBranchName,
  getPipelinesById
} = require('../requests');
const { displayPipelineStatus } = require('../helpers/display-pipeline-status-helper');
const { formateDateTime } = require('../helpers/datetime-helper');

module.exports = function Status({ config, commandOptions }) {
  const httpWireLoggingEnabled = '-verbose' in commandOptions;
  const watchModeEnabled = '-watch' in commandOptions;
  const watchModeInterval = parseInt(commandOptions['-interval'] || config.watchModeInterval, 10);

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

    const [defaultBranchPipelineDetailedResponse, ...pipelinesDetailedResponse] = await Promise.all(
      [
        getPipelinesById({
          httpClient,
          projectId: selectedProject.projectId,
          pipelineId: latestPipelineOfDefaultBranch.id,
          headers
        }),
        ...pipelinesResponse.data.map(p =>
          getPipelinesById({
            httpClient,
            projectId: selectedProject.projectId,
            pipelineId: p.id,
            headers
          })
        )
      ]
    );

    watchModeEnabled && watchModeInterval && console.clear();
    displayPipelineStatus({
      project: selectedProject,
      defaultBranchPipeline: defaultBranchPipelineDetailedResponse.data,
      pipelines: pipelinesDetailedResponse.map(p => p.data)
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
