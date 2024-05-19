'use strict';

const { DEFAULT_API_ENDPOINT } = require('../constants');

const underline = '========================================================';

async function getProjectId(prompt) {
  console.log(`\n\nProject ID\n${underline}
Go to your Gitlab project page and then click on Settings > General
Now copy the Project ID.\n`);

  const projectId = await prompt('Enter Project ID: ');

  if (!projectId.length) {
    throw new Error('Project ID missing.');
  }

  return projectId;
}

async function getProjectName(prompt) {
  console.log(`\n\nProject Name\n${underline}
You can either use the official project name as mentioned in GitLab or
use a nick name.\n`);

  const projectName = await prompt('Enter Project name: ');

  if (!projectName.length) {
    throw new Error('Project name missing.');
  }

  return projectName;
}

async function getApiEndpoint(prompt) {
  console.log(`\n\nAPI endpoint\n${underline}
Default: https://gitlab.com/api/v4

If your project link is https://gitlab.example.com/username/awesome-project
then enter https://gitlab.example.com/api/v4
Visit https://docs.gitlab.com/ee/api/rest/ to get the latest API version number.\n`);

  const apiEndpoint =
    (await prompt(`Enter API endpoint: [Default: ${DEFAULT_API_ENDPOINT}] `)) ||
    DEFAULT_API_ENDPOINT;

  return apiEndpoint;
}

async function getPersonalAccessToken(prompt) {
  console.log(`\n\nPersonal Access Token (Optional)\n${underline}
This is needed when you want to access a private GitLab repository.
Create a Personal Access Token with scope: [read_api].
Visit https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html for more details\n`);

  return await prompt('Enter read-only Personal Access Token (Optional): ');
}

async function getDefaultBranchName(prompt) {
  console.log(`\n\nDefault branch\n${underline}
Go to your Gitlab project page and then click on Settings > Repository
Select Branch defaults and copy the Default branch name.
For example, main\n`);

  const defaultBranch = await prompt('Enter default branch name: ');

  if (!defaultBranch.length) {
    throw new Error('Default branch name missing.');
  }

  return defaultBranch;
}

module.exports = {
  getProjectId,
  getProjectName,
  getApiEndpoint,
  getPersonalAccessToken,
  getDefaultBranchName
};
