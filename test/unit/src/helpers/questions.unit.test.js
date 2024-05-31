'use strict';

const {
  getProjectId,
  getProjectName,
  getApiEndpoint,
  getPersonalAccessToken,
  getDefaultBranchName
} = require('../../../../src/helpers/questions');

describe('questions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectId', () => {
    test('Sould return the project id when it is provided', async () => {
      const prompt = jest.fn(async () => '12345');
      const result = await getProjectId(prompt);
      expect(result).toBe('12345');
    });

    test('Sould throw error when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      await expect(() => getProjectId(prompt)).rejects.toThrow('Project ID missing.');
    });
  });

  describe('getProjectName', () => {
    test('Sould return the project name when it is provided', async () => {
      const prompt = jest.fn(async () => 'my-project');
      const result = await getProjectName(prompt);
      expect(result).toBe('my-project');
    });

    test('Sould throw error when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      await expect(() => getProjectName(prompt)).rejects.toThrow('Project name missing.');
    });
  });

  describe('getApiEndpoint', () => {
    test('Sould return the api endpoint when it is provided', async () => {
      const prompt = jest.fn(async () => 'https://example.com');
      const result = await getApiEndpoint(prompt);
      expect(result).toBe('https://example.com');
    });

    test('Sould return default api endpoint when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      const result = await getApiEndpoint(prompt);
      expect(result).toBe('https://gitlab.com/api/v4');
    });
  });

  describe('getPersonalAccessToken', () => {
    test('Sould return the access token when it is provided', async () => {
      const prompt = jest.fn(async () => 'abcdef1234');
      const result = await getPersonalAccessToken(prompt);
      expect(result).toBe('abcdef1234');
    });

    test('Sould return empty string when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      const result = await getPersonalAccessToken(prompt);
      expect(result).toBe('');
    });
  });

  describe('getProjectId', () => {
    test('Sould return the project id when it is provided', async () => {
      const prompt = jest.fn(async () => '12345');
      const result = await getProjectId(prompt);
      expect(result).toBe('12345');
    });

    test('Sould throw error when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      await expect(() => getProjectId(prompt)).rejects.toThrow('Project ID missing.');
    });
  });

  describe('getDefaultBranchName', () => {
    test('Sould return the branch name when it is provided', async () => {
      const prompt = jest.fn(async () => 'main');
      const result = await getDefaultBranchName(prompt);
      expect(result).toBe('main');
    });

    test('Sould throw error when input is missing', async () => {
      const prompt = jest.fn(async () => '');
      await expect(() => getDefaultBranchName(prompt)).rejects.toThrow(
        'Default branch name missing.'
      );
    });
  });
});
