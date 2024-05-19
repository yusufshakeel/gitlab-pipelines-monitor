'use strict';

const { GLPM_COMMAND } = require('../constants');
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const { getPipelinesByProjectId, getBranchByName, getPipelineByCommitId } = require('../requests');
const { displayPipelineStatus } = require('../helpers/display-pipeline-status-helper');

module.exports = function Status({ config, commandOptions }) {
  const defaultProject = config.projects[config.projects['default']];
  if (!defaultProject) {
    throw new Error(`[Status] Default Project Id is not set. Run ${GLPM_COMMAND} project --help.`);
  }

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

  const httpClient = HttpClient({
    baseURL: selectedProject.baseURL || config.api.apiEndpoint,
    timeout: config.api.timeout
  });
  const headers = getHeaders(selectedProject);

  const getStatus = async () => {
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

  return { getStatus };
};
