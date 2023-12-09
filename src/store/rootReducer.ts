import { combineReducers } from '@reduxjs/toolkit';

import appReducer from './app/slice';
import uiReducer from './ui/slice';

const rootReducer = combineReducers({
  app: appReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
