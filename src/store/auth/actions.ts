import {
  createAction,
  createAsyncAction,
  createAsyncTypes,
} from '@lib/reduxUtils';

export const LOGOUT = 'auth/logout';
export const logout = createAction(LOGOUT);

export const LOGIN = createAsyncTypes('auth/login');
export const login = createAsyncAction(LOGIN);
