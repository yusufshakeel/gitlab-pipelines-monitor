'use strict';

const {
  getProjectById,
  getPipelinesByProjectId,
  getBranchByName,
  getPipelineByCommitId
} = require('../../../../src/requests');

describe('Requests tests', () => {
  const get = jest.fn(() => {
    a: 1;
  });
  const httpClient = { get };
  const projectId = 12345;
  const headers = { 'Content-Type': 'application/json' };
  const config = {
    api: {
      perPage: 10
    }
  };
  const branchName = 'main';
  const commitId = 'abcdef1234567890abcdef1234567890abcdef12';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should be able to call getProjectById', () => {
    getProjectById({ httpClient, projectId, headers });
    expect(httpClient.get).toHaveBeenCalledWith({
      headers: { 'Content-Type': 'application/json' },
      url: '/projects/12345'
    });
  });

  test('Should be able to call getPipelinesByProjectId', () => {
    getPipelinesByProjectId({ httpClient, projectId, headers, config });
    expect(httpClient.get).toHaveBeenCalledWith({
      headers: { 'Content-Type': 'application/json' },
      url: '/projects/12345/pipelines?per_page=10'
    });
  });

  test('Should be able to call getBranchByName', () => {
    getBranchByName({ httpClient, projectId, headers, branchName });
    expect(httpClient.get).toHaveBeenCalledWith({
      headers: { 'Content-Type': 'application/json' },
      url: '/projects/12345/repository/branches?search=^main$'
    });
  });

  test('Should be able to call getPipelineByCommitId', () => {
    getPipelineByCommitId({ httpClient, projectId, headers, commitId });
    expect(httpClient.get).toHaveBeenCalledWith({
      headers: { 'Content-Type': 'application/json' },
      url: '/projects/12345/pipelines?sha=abcdef1234567890abcdef1234567890abcdef12'
    });
  });
});
