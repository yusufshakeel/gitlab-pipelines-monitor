'use strict';

function getProjectById({ httpClient, projectId, headers }) {
  return httpClient.get({ url: `/projects/${projectId}`, headers });
}

function getPipelinesByProjectId({ httpClient, projectId, headers, config }) {
  return httpClient.get({
    url: `/projects/${projectId}/pipelines?per_page=${config.api.perPage}`,
    headers
  });
}

function getBranchByName({ httpClient, projectId, branchName, headers }) {
  return httpClient.get({
    url: `/projects/${projectId}/repository/branches?search=^${branchName}$`,
    headers
  });
}

function getPipelineByCommitId({ httpClient, projectId, commitId, headers }) {
  return httpClient.get({
    url: `/projects/${projectId}/pipelines?sha=${commitId}`,
    headers
  });
}

module.exports = {
  getProjectById,
  getPipelinesByProjectId,
  getBranchByName,
  getPipelineByCommitId
};
