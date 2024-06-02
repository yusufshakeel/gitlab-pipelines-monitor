'use strict';

const path = require('path');
const express = require('express');
const CONSTANTS = require('../constants');
const app = express();
app.use(express.static(path.join(__dirname, './../../public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/projects', (req, res) => {});

app.get('/pipelines/statuses', (req, res) => {});

app.listen(CONSTANTS.SERVER.HTTP_PORT, () => {
  console.log(`Server started on http://localhost:${CONSTANTS.SERVER.HTTP_PORT}`);
});
