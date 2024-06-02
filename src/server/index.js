'use strict';

const path = require('path');
const express = require('express');
const CONSTANTS = require('../constants');
const projectService = require('../services/project-service')();

const app = express();
app.use(express.static(path.join(__dirname, './../../public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/projects', async (req, res) => {
  const result = await projectService.getProjects();
  res.status(result.status).json(result);
});

app.get('/projects/:projectId/statuses', async (req, res) => {
  const { projectId } = req.params;
  const result = await projectService.getStatuses(projectId);
  res.status(result.status).json(result);
});

app.listen(CONSTANTS.SERVER.HTTP_PORT, () => {
  console.log(`Server started on http://localhost:${CONSTANTS.SERVER.HTTP_PORT}`);
});
