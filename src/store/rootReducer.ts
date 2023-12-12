import { combineReducers } from '@reduxjs/toolkit';

import appReducer from './app/slice';
import authSlice from './auth/slice';
import uiReducer from './ui/slice';
import partnershipReducer from './partnership/slice';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authSlice,
  partnership: partnershipReducer,
  ui: uiReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;
