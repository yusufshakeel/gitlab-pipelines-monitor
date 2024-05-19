'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../constants');
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const { getPipelinesByProjectId, getBranchByName, getPipelineByCommitId } = require('../requests');
const { displayPipelineStatus } = require('../helpers/display-pipeline-status-helper');

module.exports = function Status({ config, commandOptions }) {
  const defaultProject = config.projects[config.projects['default']];
  if (!defaultProject) {
    throw new Error(`[Status] Default Project Id is not set. Run ${GLPM_COMMAND} project --help.`);
  }

  const getStatusAndRender = async selectedProject => {
    const httpClient = HttpClient({
      baseURL: selectedProject.baseURL || config.api.apiEndpoint,
      timeout: config.api.timeout
    });
    const headers = getHeaders(selectedProject);

    const pipelinesRequest = getPipelinesByProjectId({
      httpClient,
      headers,
      config,
      projectId: selectedProject.projectId
    });
    const defaultBranchRequest = getBranchByName({
      httpClient,
      headers,
      projectId: selectedProject.projectId,
      branchName: selectedProject.defaultBranch
    });
    const [pipelinesResponse, defaultBranchResponse] = await Promise.all([
      pipelinesRequest,
      defaultBranchRequest
    ]);
    const defaultBranch = defaultBranchResponse.data.find(
      v => v.name === selectedProject.defaultBranch
    );
    if (!defaultBranch) {
      throw new Error('[Status] Default branch not found.');
    }
    const pipelinesOfDefaultBranchResponse = await getPipelineByCommitId({
      httpClient,
      headers,
      config,
      projectId: selectedProject.projectId,
      commitId: defaultBranch.commit.id
    });
    const latestPipelineOfDefaultBranch = pipelinesOfDefaultBranchResponse.data.find(
      v => v.ref === selectedProject.defaultBranch
    );
    displayPipelineStatus({
      project: selectedProject,
      pipelines: latestPipelineOfDefaultBranch
        ? [latestPipelineOfDefaultBranch, ...pipelinesResponse.data]
        : [...pipelinesResponse.data]
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
