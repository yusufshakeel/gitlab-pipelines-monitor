'use strict';
const HttpClient = require('../client/http-client');
const { getHeaders } = require('../helpers/http-request-headers');
const { getBranchByName, getProjectById } = require('../requests');
const { GLPM_CONFIG_FILE, HOME_DIR, DEFAULT_API_TIMEOUT } = require('../constants');
const {
  getProjectId,
  getApiEndpoint,
  getPersonalAccessToken,
  getDefaultBranchName
} = require('../helpers/questions');

module.exports = async function getProjectInput(prompt) {
  const projectId = await getProjectId(prompt);
  const apiEndpoint = await getApiEndpoint(prompt);
  const personalAccessToken = await getPersonalAccessToken(prompt);
  const defaultBranch = await getDefaultBranchName(prompt);

  console.log(`\n\nFetching project details...`);
  const httpClient = HttpClient({ baseURL: apiEndpoint, timeout: DEFAULT_API_TIMEOUT });
  const headers = getHeaders({ personalAccessToken });
  const [projectDetails, branchDetails] = await Promise.all([
    getProjectById({ httpClient, headers, projectId }),
    getBranchByName({ httpClient, headers, projectId, branchName: defaultBranch })
  ]);
  if (projectDetails?.status !== 200 || !projectDetails?.data?.id) {
    throw new Error('Project not found!');
  }
  if (branchDetails?.status !== 200 || !branchDetails?.data?.[0]?.name === defaultBranch) {
    throw new Error('Branch not found!');
  }

  console.log(`\n\nAbout to create ${GLPM_CONFIG_FILE} file in ${HOME_DIR} directory.`);

  const input = {
    projectId,
    projectName: projectDetails.data.name,
    projectUrl: projectDetails.data['web_url'],
    apiEndpoint,
    personalAccessToken,
    defaultBranch,
    defaultBranchUrl: branchDetails.data[0]['web_url']
  };

  console.log(
    JSON.stringify(
      {
        ...input,
        personalAccessToken: personalAccessToken.length ? '***' : ''
      },
      null,
      2
    )
  );

  const isItOkay = await prompt('Is it okay? (y/n) ');
  if (isItOkay.toLowerCase() === 'n') {
    throw new Error('Aborting...');
  }

  return input;
};
