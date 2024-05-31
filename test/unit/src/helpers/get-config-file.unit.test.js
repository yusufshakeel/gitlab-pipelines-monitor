'use strict';

const fs = require('fs');
const getConfigFile = require('../../../../src/helpers/get-config-file');
const { GLPM_CONFIG_FILE_PATH } = require('../../../../src/constants');

describe('getConfigFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When file does not exists', () => {
    test('Should throw error', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue('');
      expect(() => getConfigFile()).toThrow(
        '.glpmrc file is not yet set. Run "glpm init" command to configure.'
      );
      expect(fs.existsSync).toHaveBeenCalled();
    });
  });

  describe('When file does not exists', () => {
    test('Should throw error', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue('exists');
      jest.spyOn(fs, 'readFileSync').mockReturnValue('');
      expect(() => getConfigFile()).toThrow(
        `Failed to read ${GLPM_CONFIG_FILE_PATH} file. Unexpected end of JSON input`
      );
      expect(fs.existsSync).toHaveBeenCalledWith(GLPM_CONFIG_FILE_PATH);
      expect(fs.readFileSync).toHaveBeenCalledWith(GLPM_CONFIG_FILE_PATH, 'utf8');
    });
  });
});
