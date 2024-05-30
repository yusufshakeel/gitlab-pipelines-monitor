'use strict';
const colors = require('colors');

const getStatus = d => {
  const columnWidth = 22;
  let status = d.status.toUpperCase();
  const rightPadding = new Array(columnWidth - status.length).fill(' ').join('');
  return `${status}${rightPadding}`;
};

const getShortCommitId = d => d.sha.substring(0, 9);

const getBranchName = d => d.ref.substring(0, 20);

const getPipelineId = d => {
  const columnWidth = 15;
  const pipelineId = d.id;
  const rightPadding = new Array(columnWidth - pipelineId.toString().length).fill(' ').join('');
  return `${pipelineId}${rightPadding}`;
};

const LOG = console.log;

function displayPipelineStatus({ project, pipelines }) {
  LOG(
    `\n\nSTATUS\nProject ID: ${project.projectId}
Project Name: ${project.projectName}
Default Branch: ${project.defaultBranch}
Project Url: ${project.projectUrl}`
  );
  LOG(
    '+--------------------------+------------------------+-----------------+-----------+---------------'
  );
  LOG('| Timestamp                | Status                 | Pipeline        | Commit    | Branch');
  LOG(
    '+--------------------------+------------------------+-----------------+-----------+---------------'
  );
  pipelines.forEach(d => {
    const updatedAt = d['updated_at'];
    if (d.status === 'success') {
      LOG(
        `| ${updatedAt} | ${colors.green(getStatus(d))} | ${getPipelineId(d)} | ${getShortCommitId(
          d
        )} | ${getBranchName(d)}`
      );
    } else if (d.status === 'failed') {
      LOG(
        `| ${updatedAt} | ${colors.bgRed(getStatus(d))} | ${getPipelineId(d)} | ${getShortCommitId(
          d
        )} | ${getBranchName(d)}`
      );
    } else {
      LOG(
        `| ${updatedAt} | ${getStatus(d)} | ${getPipelineId(d)} | ${getShortCommitId(
          d
        )} | ${getBranchName(d)}`
      );
    }
  });
  LOG(
    '+--------------------------+------------------------+-----------------+-----------+---------------'
  );
}

module.exports = { displayPipelineStatus };
