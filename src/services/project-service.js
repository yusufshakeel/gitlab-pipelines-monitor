'use strict';

const getConfigFile = require('../helpers/get-config-file');

module.exports = async function projectService() {
  try {
    const configFileContent = getConfigFile();
    const { ['default']: defaultProjectId, ...allProjects } = configFileContent.projects;
    const allProjectsJson = Object.values(allProjects).map(
      ({ projectId, projectName, projectUrl }) => {
        return { id: projectId, name: projectName, url: projectUrl };
      }
    );
    return {
      status: 200,
      json: {
        data: {
          defaultProjectId,
          projects: allProjectsJson
        }
      }
    };
  } catch (e) {
    return {
      status: 400,
      json: {
        error: {
          message: e.message
        }
      }
    };
  }
};
