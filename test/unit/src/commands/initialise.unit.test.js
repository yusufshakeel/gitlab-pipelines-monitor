'use strict';
const fs = require('fs');
const readline = require('readline');
const run = require('../../../../src/commands/initialise');
const getProjectInput = require('../../../../src/helpers/get-project-input');
const {
  GLPM_CONFIG_FILE,
  GLPM_CONFIG_FILE_PATH,
  DEFAULT_API_TIMEOUT,
  PER_PAGE,
  DEFAULT_API_ENDPOINT
} = require('../../../../src/constants');

jest.mock('fs');
jest.mock('readline');
jest.mock('../../../../src/helpers/get-project-input');

describe('run', () => {
  let readlineMock;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    readlineMock = {
      question: jest.fn(),
      close: jest.fn()
    };
    readline.createInterface.mockReturnValue(readlineMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create the GLPM_CONFIG_FILE and log "Done!"', async () => {
    const mockProjectInput = {
      projectId: '123',
      projectName: 'Test Project',
      projectUrl: 'http://example.com/project',
      apiEndpoint: 'http://example.com/api',
      personalAccessToken: 'token',
      defaultBranch: 'main',
      defaultBranchUrl: 'http://example.com/branch'
    };

    getProjectInput.mockResolvedValue(mockProjectInput);

    await run();

    expect(console.log).toHaveBeenCalledWith(
      `This command will help you in creating the ${GLPM_CONFIG_FILE} file.`
    );
    expect(console.log).toHaveBeenCalledWith('Press Ctrl+C at any time to quit.\n');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      GLPM_CONFIG_FILE_PATH,
      JSON.stringify({
        projects: {
          [mockProjectInput.projectId]: mockProjectInput,
          ['default']: mockProjectInput.projectId
        },
        api: {
          defaultApiEndpoint: DEFAULT_API_ENDPOINT,
          timeout: DEFAULT_API_TIMEOUT,
          perPage: PER_PAGE
        }
      }),
      'utf8'
    );
    expect(console.log).toHaveBeenCalledWith('Done!');
    expect(readlineMock.close).toHaveBeenCalled();
  });

  test('should log an error message if the init operation fails', async () => {
    const errorMessage = 'Some error';
    getProjectInput.mockRejectedValue(new Error(errorMessage));

    await run();

    expect(console.error).toHaveBeenCalledWith('Init operation failed.', errorMessage);
    expect(readlineMock.close).toHaveBeenCalled();
  });
});
