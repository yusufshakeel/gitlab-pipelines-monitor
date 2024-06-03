'use strict';

const HttpClient = require('../../../../src/client/http-client');
const { getHeaders } = require('../../../../src/helpers/http-request-headers');
const {
  getPipelinesByProjectId,
  getPipelinesByBranchName,
  getPipelinesById
} = require('../../../../src/requests');
const { HTTP_WIRE_LOGGING } = require('../../../../src/constants');
const ProjectService = require('../../../../src/services/project-service');

jest.mock('../../../../src/client/http-client');
jest.mock('../../../../src/helpers/http-request-headers');
jest.mock('../../../../src/requests');

describe('ProjectService', () => {
  const config = {
    projects: {
      ['default']: 'project1',
      project1: {
        projectId: '1',
        projectName: 'Project One',
        projectUrl: 'http://project.one',
        apiEndpoint: 'http://api.project.one',
        defaultBranch: 'main'
      },
      project2: {
        projectId: '2',
        projectName: 'Project Two',
        projectUrl: 'http://project.two'
      }
    },
    api: {
      apiEndpoint: 'http://api.default',
      timeout: 5000
    }
  };

  let service;

  beforeEach(() => {
    service = ProjectService({ config });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    test('should return the projects in the expected format', async () => {
      const result = await service.getProjects();
      expect(result).toEqual({
        defaultProjectId: 'project1',
        projects: [
          { id: '1', name: 'Project One', url: 'http://project.one' },
          { id: '2', name: 'Project Two', url: 'http://project.two' }
        ]
      });
    });
  });

  describe('getStatuses', () => {
    test('should return the statuses of the pipelines', async () => {
      const selectedProject = config.projects.project1;

      HttpClient.mockReturnValue({
        get: jest.fn()
      });
      getHeaders.mockReturnValue({});

      const pipelinesResponse = {
        data: [{ id: 101 }, { id: 102 }]
      };
      const defaultBranchPipelineResponse = {
        data: [{ id: 103, ref: 'main' }]
      };
      const detailedPipelineResponse = {
        data: { id: 101, status: 'success' }
      };

      getPipelinesByProjectId.mockResolvedValue(pipelinesResponse);
      getPipelinesByBranchName.mockResolvedValue(defaultBranchPipelineResponse);
      getPipelinesById
        .mockResolvedValueOnce(detailedPipelineResponse)
        .mockResolvedValueOnce(detailedPipelineResponse)
        .mockResolvedValueOnce(detailedPipelineResponse);

      const result = await service.getStatuses('project1');
      expect(result).toEqual({
        project: {
          id: '1',
          name: 'Project One',
          url: 'http://project.one'
        },
        defaultBranchPipeline: { id: 101, status: 'success' },
        pipelines: [
          { id: 101, status: 'success' },
          { id: 101, status: 'success' }
        ]
      });

      expect(HttpClient).toHaveBeenCalledWith({
        baseURL: 'http://api.project.one',
        timeout: 5000,
        httpWireLoggingEnabled: HTTP_WIRE_LOGGING
      });
      expect(getHeaders).toHaveBeenCalledWith(selectedProject);
      expect(getPipelinesByProjectId).toHaveBeenCalledWith({
        httpClient: expect.anything(),
        headers: {},
        config,
        projectId: '1'
      });
      expect(getPipelinesByBranchName).toHaveBeenCalledWith({
        httpClient: expect.anything(),
        headers: {},
        projectId: '1',
        branchName: 'main',
        config: { api: { perPage: 1 } }
      });
      expect(getPipelinesById).toHaveBeenCalledTimes(3);
    });

    test('should throw an error if project id is not found', async () => {
      await expect(service.getStatuses('invalidProject')).rejects.toThrow('Project Id not found.');
    });

    test('should throw an error if pipeline of the default branch is not found', async () => {
      getPipelinesByBranchName.mockResolvedValueOnce({ data: [] });
      await expect(service.getStatuses('project1')).rejects.toThrow(
        'Pipeline of the default branch main not found.'
      );
    });

    test('should throw an error if failed to fetch pipelines', async () => {
      getPipelinesByProjectId.mockResolvedValueOnce({ data: null });
      await expect(service.getStatuses('project1')).rejects.toThrow('Failed to fetch pipelines.');
    });
  });
});
