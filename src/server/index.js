'use strict';

const path = require('path');
const express = require('express');
const CONSTANTS = require('../constants');
const getConfigFile = require('../helpers/get-config-file');
const projectController = require('../controllers/project-controller')({ config: getConfigFile() });

const app = express();
app.use(express.static(path.join(__dirname, './../../public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/projects', async (req, res) => {
  const result = await projectController.getProjects();
  res.status(result.status).json(result);
});

app.get('/projects/:projectId/statuses', async (req, res) => {
  const { projectId } = req.params;
  const result = await projectController.getStatuses(projectId);
  res.status(result.status).json(result);
});

app.listen(CONSTANTS.SERVER.HTTP_PORT, () => {
  console.log(`Server started on http://localhost:${CONSTANTS.SERVER.HTTP_PORT}`);
});
