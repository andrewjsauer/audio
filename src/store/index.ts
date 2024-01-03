import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { createLogger } from 'redux-logger';

import rootReducer, { RootReducerState } from './rootReducer';

const middleware: any = [];

if (__DEV__) {
  middleware.push(
    createLogger({
      collapsed: true,
      diff: true,
    }),
  );
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const setupStore = (preloadedState?: Partial<RootReducerState>) => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat(middleware),
    preloadedState,
    devTools: __DEV__,
  });

  const persistor = persistStore(store);

  if (__DEV__) {
    // console.log('STORE PURGED');
    // persistor.purge();
  }

  return { store, persistor };
};

export type AppDispatch = ReturnType<typeof setupStore>['store']['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default setupStore;
