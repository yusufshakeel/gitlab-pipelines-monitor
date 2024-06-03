'use strict';

const { GLPM_COMMAND, GLPM_CONFIG_FILE } = require('../../../../src/constants');
const Status = require('../../../../src/commands/status');
const HttpClient = require('../../../../src/client/http-client');
const { getHeaders } = require('../../../../src/helpers/http-request-headers');
const {
  getPipelinesByProjectId,
  getPipelinesByBranchName,
  getPipelinesById
} = require('../../../../src/requests');
const { displayPipelineStatus } = require('../../../../src/helpers/display-pipeline-status-helper');

// Mock the dependencies
jest.mock('../../../../src/client/http-client');
jest.mock('../../../../src/helpers/http-request-headers');
jest.mock('../../../../src/requests');
jest.mock('../../../../src/helpers/display-pipeline-status-helper');
jest.mock('../../../../src/helpers/datetime-helper');

describe('Status', () => {
  let config;
  let commandOptions;

  beforeEach(() => {
    jest.clearAllMocks();
    config = {
      projects: {
        ['default']: 1,
        1: { projectId: 1, apiEndpoint: 'https://gitlab.com/api/v4', defaultBranch: 'main' }
      },
      api: { apiEndpoint: 'https://gitlab.com/api/v4', timeout: 5000, perPage: 20 },
      watchModeInterval: 5000
    };
    commandOptions = {};
  });

  test('should throw an error if the default project is not set', () => {
    config.projects['default'] = undefined;
    expect(() => Status({ config, commandOptions }).run()).toThrow(
      `[Status] Default Project Id is not set. Run ${GLPM_COMMAND} project --help.`
    );
  });

  test('should fetch and display pipeline status for the default project', async () => {
    getPipelinesByProjectId.mockResolvedValue({ status: 200, data: [{ id: 1 }] });
    getPipelinesByBranchName.mockResolvedValue({
      status: 200,
      data: [{ id: 1, ref: 'main' }]
    });
    getPipelinesById.mockResolvedValue({ status: 200, data: { id: 1 } });

    await Status({ config, commandOptions }).run();

    expect(HttpClient).toHaveBeenCalled();
    expect(getHeaders).toHaveBeenCalled();
    expect(getPipelinesByProjectId).toHaveBeenCalled();
    expect(getPipelinesByBranchName).toHaveBeenCalled();
    expect(getPipelinesById).toHaveBeenCalled();
    expect(displayPipelineStatus).toHaveBeenCalled();
  });

  test('should throw an error if the default branch pipeline is not found', async () => {
    getPipelinesByProjectId.mockResolvedValue({ status: 200, data: [{ id: 1 }] });
    getPipelinesByBranchName.mockResolvedValue({ status: 200, data: [] });

    await expect(Status({ config, commandOptions }).run()).rejects.toThrow(
      'Pipeline of the default branch main not found.'
    );
  });

  test('should throw an error if the project ID from command options is not found', async () => {
    commandOptions['-projectId'] = '2';
    await expect(Status({ config, commandOptions }).run()).rejects.toThrow(
      `[Status] Project Id 2 is not added. Run ${GLPM_COMMAND} project --help to check how to add new projects.`
    );
  });

  test('should fetch and display pipeline status for a project by name', async () => {
    config.projects['2'] = {
      projectId: '2',
      apiEndpoint: 'https://gitlab.com/api/v4',
      defaultBranch: 'main',
      projectName: 'test-project'
    };
    commandOptions['-name'] = 'test-project';

    getPipelinesByProjectId.mockResolvedValue({ status: 200, data: [{ id: 1 }] });
    getPipelinesByBranchName.mockResolvedValue({
      status: 200,
      data: [{ id: 1, ref: 'main' }]
    });
    getPipelinesById.mockResolvedValue({ status: 200, data: { id: 1 } });

    await Status({ config, commandOptions }).run();

    expect(HttpClient).toHaveBeenCalled();
    expect(getHeaders).toHaveBeenCalled();
    expect(getPipelinesByProjectId).toHaveBeenCalled();
    expect(getPipelinesByBranchName).toHaveBeenCalled();
    expect(getPipelinesById).toHaveBeenCalled();
    expect(displayPipelineStatus).toHaveBeenCalled();
  });

  test('should throw an error if the project name is missing', async () => {
    commandOptions['-name'] = '';

    await expect(Status({ config, commandOptions }).run()).rejects.toThrow(
      '[Status] Project name missing.'
    );
  });

  test('should throw an error if no project matches the given name', async () => {
    commandOptions['-name'] = 'non-existent-project';

    await expect(Status({ config, commandOptions }).run()).rejects.toThrow(
      `[Status] No project found by the name non-existent-project in ${GLPM_CONFIG_FILE} file.`
    );
  });
});
