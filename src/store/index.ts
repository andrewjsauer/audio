import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from './rootReducer';

const setupStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  return store;
};

export default setupStore;
