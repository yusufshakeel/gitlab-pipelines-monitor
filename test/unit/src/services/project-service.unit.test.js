'use strict';

const projectService = require('../../../../src/services/project-service');
const getConfigFile = require('../../../../src/helpers/get-config-file');

jest.mock('../../../../src/helpers/get-config-file');

describe('projectService', () => {
  it('should return the correct response when getConfigFile succeeds', async () => {
    const mockConfigFileContent = {
      projects: {
        ['default']: '123',
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
      json: {
        data: {
          defaultProjectId: '123',
          projects: [
            { id: '123', name: 'Test Project', url: 'http://example.com' },
            { id: '456', name: 'Another Project', url: 'http://anotherexample.com' }
          ]
        }
      }
    };

    const response = await projectService();
    expect(response).toEqual(expectedResponse);
  });

  it('should return an error response when getConfigFile throws an error', async () => {
    const mockError = new Error('Mocked Error');
    getConfigFile.mockImplementation(() => {
      throw mockError;
    });

    const expectedErrorResponse = {
      status: 400,
      json: {
        error: {
          message: 'Mocked Error'
        }
      }
    };

    const response = await projectService();
    expect(response).toEqual(expectedErrorResponse);
  });
});
