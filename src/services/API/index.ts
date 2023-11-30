import { camelizeKeys } from 'humps';
import Config from 'react-native-config';
import Request from '@lib/request';

type RequestConfig = {
  url: string;
  method: string;
  data?: any;
  headers?: any;
};

type LoginResponse = {
  token: string;
};

const requestInstance = Request.createInstance({
  baseURL: Config.apiUrl,
  withCredentials: true,
});

export const request = async (config: RequestConfig, token?: string) =>
  requestInstance({
    ...config,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

const API = {
  login: async (code: string): Promise<LoginResponse> => {
    const response = await request({
      url: '/login',
      method: 'post',
      data: { code },
    });

    return camelizeKeys(response.data) as LoginResponse;
  },
};

export default API;
