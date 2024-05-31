'use strict';
const { Table } = require('console-table-printer');

function displayPipelineStatus({ project, defaultBranchPipeline, pipelines }) {
  const table = new Table({
    title:
      '\nReport\n' +
      `Project ID: ${project.projectId}\n` +
      `Project Name: ${project.projectName}\n` +
      `Project Url: ${project.projectUrl}\n\n` +
      `Default Branch: ${project.defaultBranch}\n` +
      `Default Branch status: ${defaultBranchPipeline.status.toUpperCase()}\n` +
      `Default Branch commit: ${defaultBranchPipeline.sha.substring(0, 9)}\n` +
      `Default Branch pipeline: ${defaultBranchPipeline.id}\n`,
    columns: [
      { name: 'Timestamp', alignment: 'left' },
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
        Timestamp: new Date(p['updated_at']).toLocaleDateString('en-GB', {
          year: 'numeric',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
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
