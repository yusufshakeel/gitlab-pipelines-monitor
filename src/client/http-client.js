'use strict';
const axios = require('axios');

module.exports = function HttpClient({ baseURL, timeout }) {
  console.log('[HTTP Client] baseURL:', baseURL);
  console.log('[HTTP Client] timeout:', timeout);

  const instance = axios.create({ baseURL, timeout });

  const setHeaders = headers =>
    instance.interceptors.request.use(req => {
      req.headers = { ...req.headers, headers, ...headers };
      return req;
    });

  instance.interceptors.request.use(req => {
    console.log(`[HTTP Client] Request: ${req.method.toUpperCase()} ${req.baseURL}${req.url}`);
    return req;
  });

  instance.interceptors.response.use(
    res => {
      console.log(
        `[HTTP Client] Response: ${res.status} ${res.config.method.toUpperCase()} ${
          res.config.baseURL
        }${res.config.url}`
      );
      if (res.status === 200) {
        return { status: res.status, data: res.data };
      }
      return res;
    },
    err => {
      console.log(`[HTTP Client] Response error: ${err}`);
      throw Promise.reject(err);
    }
  );

  const timeoutSetup = source =>
    setTimeout(() => source.cancel(`[HTTP Client] Request timed out after ${timeout}ms.`), timeout);

  const get = async ({ url, headers }) => {
    Object.keys(headers).length && setHeaders(headers);
    const source = axios.CancelToken.source();
    const timeoutId = timeoutSetup(source);
    try {
      return await instance.get(url, { cancelToken: source.token });
    } catch (e) {
      console.log(`[HTTP Client] Error GET ${url}: ${e.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return { get };
};
