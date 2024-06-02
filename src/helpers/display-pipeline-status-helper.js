'use strict';
const { Table } = require('console-table-printer');
const { formateDateTime } = require('../helpers/datetime-helper');

function displayPipelineStatus({ project, defaultBranchPipeline, pipelines }) {
  const table = new Table({
    title:
      `\nPROJECT: ${project.projectName}\n--------------------\n` +
      `Id: ${project.projectId}\n` +
      `Url: ${project.projectUrl}\n\n` +
      `DEFAULT BRANCH: ${project.defaultBranch}\n--------------------\n` +
      `Status: ${defaultBranchPipeline.status.toUpperCase()} | ` +
      `Commit: ${defaultBranchPipeline.sha.substring(0, 8)} | ` +
      `Pipeline: ${defaultBranchPipeline.id} | ` +
      `UpdatedAt: ${formateDateTime(defaultBranchPipeline['updated_at'])}\n`,
    columns: [
      { name: 'UpdatedAt', alignment: 'left' },
      { name: 'Pipeline', alignment: 'left' },
      { name: 'Commit', alignment: 'left' },
      { name: 'Status', alignment: 'left' },
      { name: 'Branch', alignment: 'left', maxLen: 40 }
    ],
    colorMap: {
      custom_red_color: '\x1b[1;97m\x1b[41m'
    }
  });
  pipelines.forEach(p => {
    table.addRow(
      {
        UpdatedAt: formateDateTime(p['updated_at']),
        Pipeline: p.id,
        Commit: p.sha.substring(0, 9),
        Status: p.status.toUpperCase(),
        Branch: p.ref.substring(0, 40)
      },
      {
        color: { success: 'green', failed: 'custom_red_color', running: 'cyan' }[p.status]
      }
    );
  });
  table.printTable();
}

module.exports = { displayPipelineStatus };
