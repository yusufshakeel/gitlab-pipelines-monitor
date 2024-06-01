'use strict';

const Status = require('../../../../src/commands/status');
const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../../../../src/constants');
const { displayPipelineStatus } = require('../../../../src/helpers/display-pipeline-status-helper');
const { getPipelinesByProjectId, getPipelinesByBranchName } = require('../../../../src/requests');

// jest.mock('../../../../src/client/http-client');
jest.mock('../../../../src/requests');
jest.mock('../../../../src/helpers/display-pipeline-status-helper');

describe('Status', () => {
  let mockConfig;
  let mockCommandOptions;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());

    mockConfig = {
      projects: {
        ['default']: 'project123',
        project123: {
          projectId: 'project123',
          projectName: 'Project 123',
          apiEndpoint: 'http://example.com/api/project123',
          defaultBranch: 'main'
        }
      },
      api: {
        apiEndpoint: 'http://example.com/api',
        timeout: 5000,
        perPage: 10
      }
    };

    mockCommandOptions = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatus', () => {
    test('should get status for default project', async () => {
      const mockPipelineResponse = {
        status: 200,
        data: [
          { ref: 'main', status: 'success', pipelineId: '12345' },
          { ref: 'main', status: 'failed', pipelineId: '67890' }
        ]
      };
      const mockDefaultBranchPipelineResponse = {
        status: 200,
        data: [{ ref: 'main', status: 'success', pipelineId: '12345' }]
      };

      getPipelinesByProjectId.mockResolvedValue(mockPipelineResponse);
      getPipelinesByBranchName.mockResolvedValue(mockDefaultBranchPipelineResponse);

      const status = Status({ config: mockConfig, commandOptions: mockCommandOptions });
      await status.run();

      expect(getPipelinesByProjectId).toHaveBeenCalledWith({
        httpClient: expect.any(Object),
        headers: expect.any(Object),
        config: mockConfig,
        projectId: 'project123'
      });
      expect(getPipelinesByBranchName).toHaveBeenCalledWith({
        httpClient: expect.any(Object),
        headers: expect.any(Object),
        projectId: 'project123',
        branchName: 'main',
        config: { api: { perPage: 1 } }
      });
      expect(displayPipelineStatus).toHaveBeenCalledWith({
        project: {
          apiEndpoint: 'http://example.com/api/project123',
          defaultBranch: 'main',
          projectId: 'project123',
          projectName: 'Project 123'
        },
        defaultBranchPipeline: mockDefaultBranchPipelineResponse.data[0],
        pipelines: mockPipelineResponse.data
      });
    });

    test('should throw error if default branch pipeline not found', async () => {
      const mockPipelineResponse = {
        status: 200,
        data: [{ ref: 'feature-branch', status: 'success', pipelineId: '54321' }]
      };
      const mockDefaultBranchPipelineResponse = {
        status: 200,
        data: []
      };

      getPipelinesByProjectId.mockResolvedValue(mockPipelineResponse);
      getPipelinesByBranchName.mockResolvedValue(mockDefaultBranchPipelineResponse);

      const status = Status({ config: mockConfig, commandOptions: mockCommandOptions });

      await expect(status.run()).rejects.toThrow('[Status] Default branch main not found.');
    });

    test('should throw error if projectId from commandOptions is not added', async () => {
      mockCommandOptions['-projectId'] = 'unknownProject';

      const status = Status({ config: mockConfig, commandOptions: mockCommandOptions });

      await expect(status.run()).rejects.toThrow(
        `[Status] Project Id unknownProject is not added. Run ${GLPM_COMMAND} project --help to check how to add new projects.`
      );
      expect(console.log).not.toHaveBeenCalledWith('Done!');
    });
  });

  describe('getStatusByProjectName', () => {
    test('should get status of a project by its name', async () => {
      const projectName = 'Project 123';
      const mockPipelineResponse = {
        status: 200,
        data: [{ ref: 'develop', status: 'success', pipelineId: '98765' }]
      };
      const mockDefaultBranchPipelineResponse = {
        status: 200,
        data: [{ ref: 'main', status: 'success', pipelineId: '12345' }]
      };

      getPipelinesByProjectId.mockResolvedValue(mockPipelineResponse);
      getPipelinesByBranchName.mockResolvedValue(mockDefaultBranchPipelineResponse);

      const status = Status({ config: mockConfig, commandOptions: { '-name': projectName } });

      await status.run();

      const selectedProject = mockConfig.projects['project123'];

      expect(getPipelinesByProjectId).toHaveBeenCalledWith({
        httpClient: expect.any(Object),
        headers: expect.any(Object),
        config: mockConfig,
        projectId: selectedProject.projectId
      });
      expect(displayPipelineStatus).toHaveBeenCalledWith({
        project: {
          apiEndpoint: 'http://example.com/api/project123',
          defaultBranch: 'main',
          projectId: 'project123',
          projectName: 'Project 123'
        },
        defaultBranchPipeline: {
          pipelineId: '12345',
          ref: 'main',
          status: 'success'
        },
        pipelines: mockPipelineResponse.data
      });
    });

    test('should throw error if project name is not found', async () => {
      const projectName = 'Unknown Project';

      const status = Status({ config: mockConfig, commandOptions: { '-name': projectName } });

      await expect(status.run()).rejects.toThrow(
        `[Status] No project found by the name ${projectName} in ${GLPM_CONFIG_FILE} file.`
      );
    });

    test('should throw error if project name is missing', async () => {
      const status = Status({ config: mockConfig, commandOptions: { '-name': undefined } });

      await expect(status.run()).rejects.toThrow('[Status] Project name missing.');
    });
  });

  describe('run', () => {
    test('should get status for default project when no option provided', async () => {
      const mockPipelineResponse = {
        status: 200,
        data: [
          { ref: 'main', status: 'success', pipelineId: '12345' },
          { ref: 'main', status: 'failed', pipelineId: '67890' }
        ]
      };
      const mockDefaultBranchPipelineResponse = {
        status: 200,
        data: [{ ref: 'main', status: 'success', pipelineId: '12345' }]
      };

      getPipelinesByProjectId.mockResolvedValue(mockPipelineResponse);
      getPipelinesByBranchName.mockResolvedValue(mockDefaultBranchPipelineResponse);

      const status = Status({ config: mockConfig, commandOptions: {} });
      await status.run();

      expect(getPipelinesByProjectId).toHaveBeenCalledWith({
        httpClient: expect.any(Object),
        headers: expect.any(Object),
        config: mockConfig,
        projectId: 'project123'
      });
      expect(getPipelinesByBranchName).toHaveBeenCalledWith({
        httpClient: expect.any(Object),
        headers: expect.any(Object),
        projectId: 'project123',
        branchName: 'main',
        config: { api: { perPage: 1 } }
      });
      expect(displayPipelineStatus).toHaveBeenCalledWith({
        project: {
          apiEndpoint: 'http://example.com/api/project123',
          defaultBranch: 'main',
          projectId: 'project123',
          projectName: 'Project 123'
        },
        defaultBranchPipeline: mockDefaultBranchPipelineResponse.data[0],
        pipelines: mockPipelineResponse.data
      });
    });
  });
});
