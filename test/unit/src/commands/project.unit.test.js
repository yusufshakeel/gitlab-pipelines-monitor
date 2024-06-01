'use strict';

const fs = require('fs');
const readline = require('readline');
const {
  GLPM_CONFIG_FILE,
  GLPM_CONFIG_FILE_PATH,
  GLPM_COMMAND,
  MESSAGE
} = require('../../../../src/constants');
const getConfigFile = require('../../../../src/helpers/get-config-file');
const getProjectInput = require('../../../../src/helpers/get-project-input');
const Project = require('../../../../src/commands/project');

jest.mock('fs');
jest.mock('readline');
jest.mock('../../../../src/helpers/get-config-file');
jest.mock('../../../../src/helpers/get-project-input');

describe('Project', () => {
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

  describe('list', () => {
    test('should list all projects', async () => {
      const mockConfig = {
        projects: {
          ['default']: '123',
          123: {
            projectId: '123',
            projectName: 'Test Project',
            projectUrl: 'http://example.com/project'
          }
        }
      };
      getConfigFile.mockReturnValue(mockConfig);

      const project = Project({ commandOptions: { '-list': true } });
      await project.run();

      expect(console.log).toHaveBeenCalledWith('\n\nProjects\nDefault Project Id: 123');
      expect(console.log).toHaveBeenCalledWith('+--------------+----------------------------');
      expect(console.log).toHaveBeenCalledWith('| Project Id   | 123 (Default)');
      expect(console.log).toHaveBeenCalledWith('| Project Name | Test Project');
      expect(console.log).toHaveBeenCalledWith('| Project Url  | http://example.com/project');
      expect(console.log).toHaveBeenCalledWith('+--------------+----------------------------');
    });

    test('should throw an error if config file cannot be read', async () => {
      getConfigFile.mockImplementation(() => {
        throw new Error('File not found');
      });

      const project = Project({ commandOptions: { '-list': true } });

      await expect(project.run()).rejects.toThrow(
        `[Project] Unable to read ${GLPM_CONFIG_FILE} file.`
      );
    });
  });

  describe('addProject', () => {
    test('should add a new project', async () => {
      const mockConfig = { projects: {} };
      const mockProjectInput = {
        projectId: '123',
        projectName: 'Test Project',
        projectUrl: 'http://example.com/project',
        apiEndpoint: 'http://example.com/api',
        personalAccessToken: 'token',
        defaultBranch: 'main',
        defaultBranchUrl: 'http://example.com/branch'
      };
      getConfigFile.mockReturnValue(mockConfig);
      getProjectInput.mockResolvedValue(mockProjectInput);

      const project = Project({ commandOptions: { '-add': true } });
      await project.run();

      expect(console.log).toHaveBeenCalledWith(
        `This command will help you to add/overwrite project in ${GLPM_CONFIG_FILE} file.`
      );
      expect(console.log).toHaveBeenCalledWith(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify({
          ...mockConfig,
          projects: { 123: mockProjectInput }
        }),
        'utf8'
      );
      expect(console.log).toHaveBeenCalledWith('Done!');
      expect(readlineMock.close).toHaveBeenCalled();
    });

    test('should log an error if adding project fails', async () => {
      getConfigFile.mockImplementation(() => {
        throw new Error('File not found');
      });

      const project = Project({ commandOptions: { '-add': true } });
      await project.run();

      expect(console.error).toHaveBeenCalledWith('[Project] Error: ', 'File not found');
      expect(readlineMock.close).toHaveBeenCalled();
    });
  });

  describe('addDefault', () => {
    test('should set the default project', async () => {
      const mockConfig = {
        projects: {
          123: {
            projectId: '123',
            projectName: 'Test Project',
            projectUrl: 'http://example.com/project'
          }
        }
      };
      getConfigFile.mockReturnValue(mockConfig);
      readlineMock.question.mockImplementation((query, callback) => callback('123'));

      const project = Project({ commandOptions: { '-set-default': true } });
      await project.run();

      expect(console.log).toHaveBeenCalledWith(
        `This command will help you to set the default project in ${GLPM_CONFIG_FILE} file.`
      );
      expect(console.log).toHaveBeenCalledWith(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify({
          ...mockConfig,
          projects: { ...mockConfig.projects, ['default']: '123' }
        }),
        'utf8'
      );
      expect(console.log).toHaveBeenCalledWith('Done!');
      expect(readlineMock.close).toHaveBeenCalled();
    });

    test('should log an error if setting default project fails', async () => {
      getConfigFile.mockImplementation(() => {
        throw new Error('File not found');
      });

      const project = Project({ commandOptions: { '-set-default': true } });
      await project.run();

      expect(console.error).toHaveBeenCalledWith('[Project] Error: ', 'File not found');
      expect(readlineMock.close).toHaveBeenCalled();
    });
  });

  describe('removeProject', () => {
    test('should remove a project', async () => {
      const mockConfig = {
        projects: {
          ['default']: '123',
          123: {
            projectId: '123',
            projectName: 'Test Project',
            projectUrl: 'http://example.com/project'
          },
          456: {
            projectId: '456',
            projectName: 'Another Project',
            projectUrl: 'http://example.com/another-project'
          }
        }
      };
      getConfigFile.mockReturnValue(mockConfig);
      readlineMock.question.mockImplementation((query, callback) => callback('123'));

      const project = Project({ commandOptions: { '-remove': true } });
      await project.run();

      const expectedConfig = {
        ...mockConfig,
        projects: {
          456: mockConfig.projects['456']
        }
      };

      expect(console.log).toHaveBeenCalledWith(
        `This command will help you to remove project from ${GLPM_CONFIG_FILE} file.`
      );
      expect(console.log).toHaveBeenCalledWith(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify(expectedConfig),
        'utf8'
      );
      expect(console.log).toHaveBeenCalledWith('Done!');
      expect(readlineMock.close).toHaveBeenCalled();
    });

    test('should log an error if removing project fails', async () => {
      getConfigFile.mockImplementation(() => {
        throw new Error('File not found');
      });

      const project = Project({ commandOptions: { '-remove': true } });
      await project.run();

      expect(console.error).toHaveBeenCalledWith('[Project] Error: ', 'File not found');
      expect(readlineMock.close).toHaveBeenCalled();
    });
  });

  describe('run', () => {
    test('should throw an error if an invalid command is provided', async () => {
      const project = Project({ commandOptions: { '-invalid': true } });

      await expect(project.run()).rejects.toThrow(
        `[Project] Option missing. Run ${GLPM_COMMAND} project --help.`
      );
    });
  });
});
