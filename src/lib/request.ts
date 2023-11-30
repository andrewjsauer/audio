import Debug from 'debug';
import axios from 'axios';
import axiosRetry from 'axios-retry';

const debug = Debug('reactNativeBoilerplateSetup:lib:request');
const LINEAR_RETRY_DELAY_MS = 1000;

const createInstance = (baseConfig = {}) => {
  const instance = axios.create(baseConfig);

  // Defaults to 3 retries
  axiosRetry(instance, {
    retryDelay: (retryCount) => retryCount * LINEAR_RETRY_DELAY_MS,
  });

  instance.interceptors.request.use((config) => {
    debug(
      'Sending request',
      config.method.toUpperCase(),
      config.url,
      config.data,
    );
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      debug('Received response', response);
      return response;
    },
    async (error) => {
      error.isConnectivityError = false;

      // If we failed to reach the server
      if (!error.response) {
        const isUserOnline = true; // TODO await isOnline();
        error.isConnectivityError = !isUserOnline;
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export default {
  createInstance,
};
