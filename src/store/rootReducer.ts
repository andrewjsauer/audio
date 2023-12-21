import { combineReducers } from '@reduxjs/toolkit';

import appReducer from './app/slice';
import authSlice from './auth/slice';
import uiReducer from './ui/slice';
import partnershipReducer from './partnership/slice';
import questionReducer from './question/slice';
import recordingReducer from './recording/slice';
import historyReducer from './history/slice';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authSlice,
  history: historyReducer,
  partnership: partnershipReducer,
  question: questionReducer,
  recording: recordingReducer,
  ui: uiReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;
