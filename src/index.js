#!/usr/bin/env node
'use strict';
const commands = require('./commands');
const argv = process.argv.slice(2);

commands(argv).catch(e => {
  console.log('Failed to process your request.');
  console.log('Error', e.message);
});
