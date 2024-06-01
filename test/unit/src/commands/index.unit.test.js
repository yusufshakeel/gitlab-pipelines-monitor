'use strict';

const commands = require('../../../../src/commands');
const options = require('../../../../src/commands/options');
const version = require('../../../../src/commands/version');
const initialise = require('../../../../src/commands/initialise');
const status = require('../../../../src/commands/status');
const project = require('../../../../src/commands/project');
const { GLPM_COMMAND } = require('../../../../src/constants');
const getConfigFile = require('../../../../src/helpers/get-config-file');
const commandOptionParserHelper = require('../../../../src/helpers/command-option-parser-helper');

jest.mock('../../../../src/commands/options');
jest.mock('../../../../src/commands/version');
jest.mock('../../../../src/commands/initialise');
jest.mock('../../../../src/commands/status');
jest.mock('../../../../src/commands/project');
jest.mock('../../../../src/helpers/get-config-file');
jest.mock('../../../../src/helpers/command-option-parser-helper');

describe('commands', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call initialise when argv is ["init"]', async () => {
    await commands(['init']);
    expect(initialise).toHaveBeenCalled();
  });

  test('should call options with intro-manual when argv is empty or contains --help', async () => {
    await commands([]);
    expect(options).toHaveBeenCalledWith({ command: 'intro-manual' });

    await commands(['--help']);
    expect(options).toHaveBeenCalledWith({ command: 'intro-manual' });

    await commands(['status', '--help']);
    expect(options).toHaveBeenCalledWith({ command: 'status' });
  });

  test('should call version when argv is ["version"]', async () => {
    await commands(['version']);
    expect(version).toHaveBeenCalled();
  });

  test('should call status with proper config and commandOptions', async () => {
    const mockConfig = {
      projects: { default: {} },
      api: {
        apiEndpoint: 'https://gitlab.com/api/v4',
        perPage: 16,
        timeout: 5000
      }
    };
    const mockCommandOptions = { '-projectId': '123' };

    getConfigFile.mockReturnValue(mockConfig);
    commandOptionParserHelper.mockReturnValue(mockCommandOptions);

    const mockStatus = { run: jest.fn() };
    status.mockReturnValue(mockStatus);

    await commands(['status', '-projectId', '123']);
    expect(status).toHaveBeenCalledWith({ config: mockConfig, commandOptions: mockCommandOptions });
    expect(mockStatus.run).toHaveBeenCalled();
  });

  test('should call project with proper config and commandOptions', async () => {
    const mockConfig = {
      projects: { default: {} },
      api: {
        apiEndpoint: 'https://gitlab.com/api/v4',
        perPage: 16,
        timeout: 5000
      }
    };
    const mockCommandOptions = { '-add': true };

    getConfigFile.mockReturnValue(mockConfig);
    commandOptionParserHelper.mockReturnValue(mockCommandOptions);

    const mockProject = { run: jest.fn() };
    project.mockReturnValue(mockProject);

    await commands(['project', '-add']);
    expect(project).toHaveBeenCalledWith({
      config: mockConfig,
      commandOptions: mockCommandOptions
    });
    expect(mockProject.run).toHaveBeenCalled();
  });

  test('should print "Command not Found" when an unknown command is given', async () => {
    await commands(['unknownCommand']);
    expect(console.log).toHaveBeenCalledWith(
      `\nCommand not Found\n\nTry\n➜  ${GLPM_COMMAND} --help\n`
    );
  });

  test('should log error message if getConfigFile throws an error', async () => {
    getConfigFile.mockImplementation(() => {
      throw new Error('Mocked Error');
    });

    await commands(['status']);
    expect(console.log).toHaveBeenCalledWith('Error:', 'Mocked Error');
  });

  test('should log error message if commandOptionParserHelper throws an error', async () => {
    getConfigFile.mockReturnValue({});
    commandOptionParserHelper.mockImplementation(() => {
      throw new Error('Mocked Error');
    });

    await commands(['status']);
    expect(console.log).toHaveBeenCalledWith('Error:', 'Mocked Error');
  });
});
