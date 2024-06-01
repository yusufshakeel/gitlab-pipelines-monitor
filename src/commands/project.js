'use strict';
const fs = require('fs');
const readline = require('readline');
const { GLPM_CONFIG_FILE, GLPM_CONFIG_FILE_PATH, MESSAGE } = require('../constants');
const getConfigFile = require('../helpers/get-config-file');
const getProjectInput = require('../helpers/get-project-input');

module.exports = function Project({ commandOptions }) {
  const getConfig = (currentConfig, project) => {
    return {
      ...currentConfig,
      projects: {
        ...currentConfig.projects,
        [project.projectId]: project
      }
    };
  };

  const removeProjectFromConfig = (currentConfig, projectId) => {
    if (!projectId.length) {
      throw new Error('[Project] Project Id missing.');
    }
    if (!currentConfig.projects[projectId]) {
      throw new Error(`[Project] Project Id is not present in ${GLPM_CONFIG_FILE} file.`);
    }
    const newConfig = { ...currentConfig };
    delete newConfig.projects[projectId];
    if (newConfig.projects['default'] === projectId) {
      delete newConfig.projects['default'];
    }
    return newConfig;
  };

  const setDefaultProjectInConfig = (currentConfig, projectId) => {
    if (!projectId.length) {
      throw new Error('[Project] Project Id missing.');
    }
    if (!currentConfig.projects[projectId]) {
      throw new Error(`[Project] Project Id is not present in ${GLPM_CONFIG_FILE} file.`);
    }
    return {
      ...currentConfig,
      projects: {
        ...currentConfig.projects,
        ['default']: projectId
      }
    };
  };

  const list = async () => {
    try {
      const currentConfig = getConfigFile();
      const { ['default']: defaultProjectId, ...restOfTheProjects } = currentConfig.projects;
      console.log(`\n\nProjects\nDefault Project Id: ${defaultProjectId}`);
      Object.values(restOfTheProjects).forEach(p => {
        console.log('+--------------+----------------------------');
        console.log(
          `| Project Id   | ${p.projectId} ${p.projectId === defaultProjectId ? '(Default)' : ''}`
        );
        console.log(`| Project Name | ${p.projectName}`);
        console.log(`| Project Url  | ${p.projectUrl}`);
      });
      console.log('+--------------+----------------------------');
    } catch (e) {
      throw new Error(`[Project] Unable to read ${GLPM_CONFIG_FILE} file.`);
    }
  };

  const addProject = async () => {
    const readLine = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const prompt = query => new Promise(resolve => readLine.question(query, resolve));
      const currentConfig = getConfigFile();

      console.log(
        `This command will help you to add/overwrite project in ${GLPM_CONFIG_FILE} file.`
      );
      console.log(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);

      const input = await getProjectInput(prompt);

      fs.writeFileSync(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify(getConfig(currentConfig, input)),
        'utf8'
      );
      console.log('Done!');
    } catch (error) {
      console.error('[Project] Error: ', error.message);
    } finally {
      readLine.close();
    }
  };

  const addDefault = async () => {
    const readLine = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const prompt = query => new Promise(resolve => readLine.question(query, resolve));
      const currentConfig = getConfigFile();

      console.log(
        `This command will help you to set the default project in ${GLPM_CONFIG_FILE} file.`
      );
      console.log(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);

      const input = await prompt('Enter Project Id: ');

      fs.writeFileSync(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify(setDefaultProjectInConfig(currentConfig, input)),
        'utf8'
      );
      console.log('Done!');
    } catch (error) {
      console.error('[Project] Error: ', error.message);
    } finally {
      readLine.close();
    }
  };

  const removeProject = async () => {
    const readLine = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      const prompt = query => new Promise(resolve => readLine.question(query, resolve));
      const currentConfig = getConfigFile();

      console.log(`This command will help you to remove project from ${GLPM_CONFIG_FILE} file.`);
      console.log(MESSAGE.PRESS_CTRL_C_AT_ANY_TIME_TO_QUIT);

      const input = await prompt('Enter Project Id: ');

      fs.writeFileSync(
        GLPM_CONFIG_FILE_PATH,
        JSON.stringify(removeProjectFromConfig(currentConfig, input)),
        'utf8'
      );
      console.log('Done!');
    } catch (error) {
      console.error('[Project] Error: ', error.message);
    } finally {
      readLine.close();
    }
  };

  const run = async () => {
    const commandMap = {
      '-list': () => list(),
      '-set-default': () => addDefault(),
      '-add': () => addProject(),
      '-remove': () => removeProject(),
      ['default']: () => list()
    };
    const actions = Object.keys(commandMap);
    const matchingCommandAction =
      Object.keys(commandOptions).find(v => actions.includes(v)) || 'default';
    await commandMap[matchingCommandAction]();
  };

  return { run };
};
