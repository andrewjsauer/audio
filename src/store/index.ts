import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

const setupStore = (preloadedState?: any) => {
  const store = configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat([sagaMiddleware]),
    preloadedState,
    reducer: rootReducer,
  });

  sagaMiddleware.run(rootSaga);

  return store;
};

export default setupStore;
