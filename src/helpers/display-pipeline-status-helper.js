'use strict';

const getStatus = d => {
  if (d.status === 'success') return '✅ PASSED';
  if (d.status === 'failed') return '❌ FAILED';
  return d.status.toUpperCase();
};

const getShortCommitId = d => d.sha.substring(0, 9);

const getBranchName = d => d.ref.substring(0, 20);

const getPipelineId = d => {
  const columnWidth = 15;
  const pipelineId = d.id;
  const rightPadding = new Array(columnWidth - pipelineId.toString().length).fill(' ').join('');
  return `${pipelineId}${rightPadding}`;
};

function displayPipelineStatus({ project, pipelines }) {
  console.log(
    `\n\nSTATUS\nProject ID: ${project.projectId}
Project Name: ${project.projectName}
Default Branch: ${project.defaultBranch}
Project Url: ${project.projectUrl}`
  );
  console.log(
    '+--------------------------+-----------+-----------------+-----------+---------------'
  );
  console.log('| Timestamp                | Status    | Pipeline        | Commit    | Branch');
  console.log(
    '+--------------------------+-----------+-----------------+-----------+---------------'
  );
  pipelines.forEach(d => {
    const updatedAt = d['updated_at'];
    console.log(
      `| ${updatedAt} | ${getStatus(d)} | ${getPipelineId(d)} | ${getShortCommitId(
        d
      )} | ${getBranchName(d)}`
    );
  });
  console.log(
    '+--------------------------+-----------+-----------------+-----------+---------------'
  );
}

module.exports = { displayPipelineStatus };
