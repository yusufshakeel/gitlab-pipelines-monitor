'use strict';
const ProjectService = require('../services/project-service');

module.exports = function projectController({ config }) {
  const projectService = ProjectService({ config });

  const getProjects = async () => {
    try {
      const result = await projectService.getProjects();
      return { status: 200, data: result };
    } catch (e) {
      console.log(e);
      return { status: 400, error: { message: e.message } };
    }
  };

  const getStatuses = async projectId => {
    try {
      const result = await projectService.getStatuses(projectId);
      return { status: 200, data: result };
    } catch (e) {
      return { status: 400, error: { message: e.message } };
    }
  };
  return { getProjects, getStatuses };
};
