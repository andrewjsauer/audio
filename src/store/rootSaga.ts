import { fork, all } from 'redux-saga/effects';

import authSagas from './auth/sagas';

const sagas = [...authSagas];

export default function* rootSaga() {
  yield all(sagas.map((saga) => fork(saga)));
}
