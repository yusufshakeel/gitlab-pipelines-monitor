'use strict';

const projectService = require('../../../../src/services/project-service');
const getConfigFile = require('../../../../src/helpers/get-config-file');
const HttpClient = require('../../../../src/client/http-client');
const { getHeaders } = require('../../../../src/helpers/http-request-headers');
const { getPipelinesByProjectId, getPipelinesByBranchName } = require('../../../../src/requests');
const { DEFAULT_API_TIMEOUT, PER_PAGE } = require('../../../../src/constants');

jest.mock('../../../../src/helpers/get-config-file');
jest.mock('../../../../src/client/http-client');
jest.mock('../../../../src/helpers/http-request-headers');
jest.mock('../../../../src/requests');

describe('projectService', () => {
  describe('getProjects', () => {
    it('should return the correct response when getConfigFile succeeds', async () => {
      const mockConfigFileContent = {
        projects: {
          default: '123',
          123: {
            projectId: '123',
            projectName: 'Test Project',
            projectUrl: 'http://example.com'
          },
          456: {
            projectId: '456',
            projectName: 'Another Project',
            projectUrl: 'http://anotherexample.com'
          }
        }
      };

      getConfigFile.mockReturnValue(mockConfigFileContent);

      const expectedResponse = {
        status: 200,
        data: {
          defaultProjectId: '123',
          projects: [
            { id: '123', name: 'Test Project', url: 'http://example.com' },
            { id: '456', name: 'Another Project', url: 'http://anotherexample.com' }
          ]
        }
      };

      const { getProjects } = projectService();
      const response = await getProjects();
      expect(response).toEqual(expectedResponse);
    });

    it('should return an error response when getConfigFile throws an error', async () => {
      const mockError = new Error('Mocked Error');
      getConfigFile.mockImplementation(() => {
        throw mockError;
      });

      const expectedErrorResponse = {
        status: 400,
        error: {
          message: 'Mocked Error'
        }
      };

      const { getProjects } = projectService();
      const response = await getProjects();
      expect(response).toEqual(expectedErrorResponse);
    });
  });

  describe('getStatuses', () => {
    it('should return pipeline statuses for a valid project', async () => {
      const mockConfigFileContent = {
        projects: {
          123: {
            projectId: '123',
            projectName: 'Test Project',
            projectUrl: 'http://example.com',
            apiEndpoint: 'http://api.example.com',
            defaultBranch: 'main'
          }
        },
        api: {
          apiEndpoint: 'http://api.example.com',
          timeout: DEFAULT_API_TIMEOUT,
          perPage: PER_PAGE
        }
      };

      getConfigFile.mockReturnValue(mockConfigFileContent);
      HttpClient.mockReturnValue({
        get: jest.fn()
      });
      getHeaders.mockReturnValue({
        Authorization: 'Bearer token'
      });

      const mockPipelinesResponse = {
        status: 200,
        data: [{ id: 'pipeline1' }, { id: 'pipeline2' }]
      };

      const mockDefaultBranchPipelineResponse = {
        status: 200,
        data: [{ id: 'defaultBranchPipeline', ref: 'main' }]
      };

      getPipelinesByProjectId.mockResolvedValue(mockPipelinesResponse);
      getPipelinesByBranchName.mockResolvedValue(mockDefaultBranchPipelineResponse);

      const expectedResponse = {
        status: 200,
        data: {
          pipelines: {
            defaultBranch: { id: 'defaultBranchPipeline', ref: 'main' },
            all: [{ id: 'pipeline1' }, { id: 'pipeline2' }]
          }
        }
      };

      const { getStatuses } = projectService();
      const response = await getStatuses('123');
      expect(response).toEqual(expectedResponse);
    });

    it('should return an error if projectId is not found', async () => {
      const mockConfigFileContent = {
        projects: {
          456: {
            projectId: '456',
            projectName: 'Another Project',
            projectUrl: 'http://anotherexample.com'
          }
        }
      };

      getConfigFile.mockReturnValue(mockConfigFileContent);

      const expectedErrorResponse = {
        status: 404,
        error: {
          message: 'Project Id not found.'
        }
      };

      const { getStatuses } = projectService();
      const response = await getStatuses('123');
      expect(response).toEqual(expectedErrorResponse);
    });

    it('should return an error response when an exception occurs', async () => {
      const mockError = new Error('Mocked Error');
      getConfigFile.mockImplementation(() => {
        throw mockError;
      });

      const expectedErrorResponse = {
        status: 400,
        error: {
          message: 'Mocked Error'
        }
      };

      const { getStatuses } = projectService();
      const response = await getStatuses('123');
      expect(response).toEqual(expectedErrorResponse);
    });
  });
});
