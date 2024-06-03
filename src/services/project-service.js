'use strict';

const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const {
  getPipelinesByProjectId,
  getPipelinesByBranchName,
  getPipelinesById
} = require('../requests');
const { HTTP_WIRE_LOGGING } = require('../constants');

module.exports = function ProjectService({ config }) {
  const getProjects = async () => {
    const { ['default']: defaultProjectId, ...allProjects } = config.projects;
    const allProjectsJson = Object.values(allProjects).map(
      ({ projectId, projectName, projectUrl }) => {
        return { id: projectId, name: projectName, url: projectUrl };
      }
    );
    return { defaultProjectId, projects: allProjectsJson };
  };

  const getStatuses = async projectId => {
    const selectedProject = config.projects[projectId];
    if (!selectedProject?.projectId) {
      throw new Error('Project Id not found.');
    }

    const httpClient = HttpClient({
      baseURL: selectedProject.apiEndpoint || config.api.apiEndpoint,
      timeout: config.api.timeout,
      httpWireLoggingEnabled: config.httpWireLoggingEnabled || HTTP_WIRE_LOGGING
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

    const latestPipelineOfDefaultBranch = defaultBranchPipelineResponse?.data?.[0];
    if (!latestPipelineOfDefaultBranch) {
      throw new Error(`Pipeline of the default branch ${selectedProject.defaultBranch} not found.`);
    }
    if (!pipelinesResponse?.data) {
      throw new Error('Failed to fetch pipelines.');
    }

    const [defaultBranchPipelineStatusesRequest, ...allPipelinesStatusesRequest] = [
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
    ];

    const [defaultBranchPipelineDetailedResponse, ...pipelinesDetailedResponse] = await Promise.all(
      [defaultBranchPipelineStatusesRequest, ...allPipelinesStatusesRequest]
    );

    return {
      project: {
        id: selectedProject.projectId,
        name: selectedProject.projectName,
        url: selectedProject.projectUrl
      },
      defaultBranchPipeline: defaultBranchPipelineDetailedResponse.data,
      pipelines: pipelinesDetailedResponse.map(p => p.data)
    };
  };

  return { getProjects, getStatuses };
};
