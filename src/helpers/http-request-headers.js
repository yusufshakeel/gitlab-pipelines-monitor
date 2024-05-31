'use strict';

function getHeaders(data) {
  const personalAccessToken = data.personalAccessToken?.length
    ? { 'PRIVATE-TOKEN': data.personalAccessToken }
    : {};
  return {
    ...personalAccessToken
  };
}

module.exports = { getHeaders };
