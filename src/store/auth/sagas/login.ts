import Debug from 'debug';
import { call, put, takeLatest } from 'redux-saga/effects';

import API from '@services/API';

import { LOGIN, login } from '../actions';

const debug = Debug('reactNativeBoilerplateSetup:store:auth:sagas:login');

export function* loginSaga({ payload }: any) {
  debug('Saga called', payload);

  try {
    const response: object = yield call(API.login, payload);

    yield put(login.success(response));
  } catch (e) {
    debug('Saga error', e);
    yield put(login.error(e));
  }
}

export default function* loginWithAuthCodeDefaultSaga() {
  yield takeLatest(LOGIN.PENDING, loginSaga);
}
