'use strict';

const getConfigFile = require('../helpers/get-config-file');
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const { getPipelinesByProjectId, getPipelinesByBranchName } = require('../requests');
const { DEFAULT_API_TIMEOUT, PER_PAGE, DEFAULT_API_ENDPOINT } = require('../constants');

module.exports = function projectService() {
  const getProjects = async () => {
    try {
      const configFileContent = getConfigFile();
      const { ['default']: defaultProjectId, ...allProjects } = configFileContent.projects;
      const allProjectsJson = Object.values(allProjects).map(
        ({ projectId, projectName, projectUrl }) => {
          return { id: projectId, name: projectName, url: projectUrl };
        }
      );
      return { status: 200, data: { defaultProjectId, projects: allProjectsJson } };
    } catch (e) {
      return { status: 400, error: { message: e.message } };
    }
  };

  const getStatuses = async projectId => {
    try {
      const configFileContent = getConfigFile();
      const selectedProject = configFileContent.projects[projectId];
      if (!selectedProject?.projectId) {
        return { status: 404, error: { message: 'Project Id not found.' } };
      }

      const config = {
        api: {
          apiEndpoint: DEFAULT_API_ENDPOINT,
          timeout: DEFAULT_API_TIMEOUT,
          perPage: PER_PAGE,
          ...configFileContent?.api
        }
      };

      const httpClient = HttpClient({
        baseURL: selectedProject.apiEndpoint || config.api.apiEndpoint,
        timeout: config.api.timeout,
        httpWireLoggingEnabled: true
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

      return {
        status: 200,
        data: {
          pipelines: {
            defaultBranch:
              defaultBranchPipelineResponse.status === 200
                ? defaultBranchPipelineResponse.data[0]
                : {},
            all: pipelinesResponse.status === 200 ? pipelinesResponse.data : []
          }
        }
      };
    } catch (e) {
      return { status: 400, error: { message: e.message } };
    }
  };

  return { getProjects, getStatuses };
};
