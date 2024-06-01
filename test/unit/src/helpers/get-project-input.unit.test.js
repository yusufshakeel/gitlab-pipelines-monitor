'use strict';
const getProjectInput = require('../../../../src/helpers/get-project-input');
const HttpClient = require('../../../../src/client/http-client');
const { getHeaders } = require('../../../../src/helpers/http-request-headers');
const { getBranchByName, getProjectById } = require('../../../../src/requests');
const { GLPM_CONFIG_FILE, HOME_DIR, DEFAULT_API_TIMEOUT } = require('../../../../src/constants');
const {
  getProjectId,
  getApiEndpoint,
  getPersonalAccessToken,
  getDefaultBranchName
} = require('../../../../src/helpers/questions');

jest.mock('../../../../src/client/http-client');
jest.mock('../../../../src/helpers/http-request-headers');
jest.mock('../../../../src/requests');
jest.mock('../../../../src/helpers/questions');

describe('getProjectInput', () => {
  const prompt = jest.fn();
  jest.spyOn(console, 'log');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch project and branch details and return input', async () => {
    getProjectId.mockResolvedValue(123);
    getApiEndpoint.mockResolvedValue('http://api.example.com');
    getPersonalAccessToken.mockResolvedValue('token123');
    getDefaultBranchName.mockResolvedValue('main');

    const mockHttpClient = jest.fn();
    HttpClient.mockReturnValue(mockHttpClient);

    getHeaders.mockReturnValue({ Authorization: 'Bearer token123' });

    getProjectById.mockResolvedValue({
      status: 200,
      data: {
        id: 123,
        name: 'Test Project',
        web_url: 'http://example.com/test-project'
      }
    });
    getBranchByName.mockResolvedValue({
      status: 200,
      data: [
        {
          name: 'main',
          web_url: 'http://example.com/test-project/tree/main'
        }
      ]
    });

    prompt.mockResolvedValue('y');

    const result = await getProjectInput(prompt);

    expect(result).toEqual({
      projectId: 123,
      projectName: 'Test Project',
      projectUrl: 'http://example.com/test-project',
      apiEndpoint: 'http://api.example.com',
      personalAccessToken: 'token123',
      defaultBranch: 'main',
      defaultBranchUrl: 'http://example.com/test-project/tree/main'
    });

    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenNthCalledWith(1, `\n\nFetching project details...`);
    expect(console.log).toHaveBeenNthCalledWith(
      2,
      `\n\nAbout to create ${GLPM_CONFIG_FILE} file in ${HOME_DIR} directory.`
    );
    expect(console.log).toHaveBeenNthCalledWith(
      3,
      JSON.stringify(
        {
          projectId: 123,
          projectName: 'Test Project',
          projectUrl: 'http://example.com/test-project',
          apiEndpoint: 'http://api.example.com',
          personalAccessToken: '*** REDACTED ***',
          defaultBranch: 'main',
          defaultBranchUrl: 'http://example.com/test-project/tree/main'
        },
        null,
        2
      )
    );

    expect(HttpClient).toHaveBeenCalledWith({
      baseURL: 'http://api.example.com',
      timeout: DEFAULT_API_TIMEOUT
    });
    expect(getHeaders).toHaveBeenCalledWith({ personalAccessToken: 'token123' });
    expect(getProjectById).toHaveBeenCalledWith({
      httpClient: mockHttpClient,
      headers: { Authorization: 'Bearer token123' },
      projectId: 123
    });
    expect(getBranchByName).toHaveBeenCalledWith({
      httpClient: mockHttpClient,
      headers: { Authorization: 'Bearer token123' },
      projectId: 123,
      branchName: 'main'
    });
  });

  it('should throw an error if project not found', async () => {
    getProjectId.mockResolvedValue(123);
    getApiEndpoint.mockResolvedValue('http://api.example.com');
    getPersonalAccessToken.mockResolvedValue('token123');
    getDefaultBranchName.mockResolvedValue('main');

    HttpClient.mockReturnValue(jest.fn());
    getHeaders.mockReturnValue({ Authorization: 'Bearer token123' });

    getProjectById.mockResolvedValue({ status: 404 });
    getBranchByName.mockResolvedValue({
      status: 200,
      data: [{ name: 'main', web_url: 'http://example.com/test-project/tree/main' }]
    });

    await expect(getProjectInput(prompt)).rejects.toThrow('Project not found!');
  });

  it('should throw an error if branch not found', async () => {
    getProjectId.mockResolvedValue(123);
    getApiEndpoint.mockResolvedValue('http://api.example.com');
    getPersonalAccessToken.mockResolvedValue('token123');
    getDefaultBranchName.mockResolvedValue('main');

    HttpClient.mockReturnValue(jest.fn());
    getHeaders.mockReturnValue({ Authorization: 'Bearer token123' });

    getProjectById.mockResolvedValue({
      status: 200,
      data: {
        id: 123,
        name: 'Test Project',
        web_url: 'http://example.com/test-project'
      }
    });
    getBranchByName.mockResolvedValue({ status: 404 });

    await expect(getProjectInput(prompt)).rejects.toThrow('Branch not found!');
  });

  it('should throw an error if user does not confirm', async () => {
    getProjectId.mockResolvedValue(123);
    getApiEndpoint.mockResolvedValue('http://api.example.com');
    getPersonalAccessToken.mockResolvedValue('token123');
    getDefaultBranchName.mockResolvedValue('main');

    HttpClient.mockReturnValue(jest.fn());
    getHeaders.mockReturnValue({ Authorization: 'Bearer token123' });

    getProjectById.mockResolvedValue({
      status: 200,
      data: {
        id: 123,
        name: 'Test Project',
        web_url: 'http://example.com/test-project'
      }
    });
    getBranchByName.mockResolvedValue({
      status: 200,
      data: [
        {
          name: 'main',
          web_url: 'http://example.com/test-project/tree/main'
        }
      ]
    });

    prompt.mockResolvedValue('n');

    await expect(getProjectInput(prompt)).rejects.toThrow('Aborting...');
  });
});
