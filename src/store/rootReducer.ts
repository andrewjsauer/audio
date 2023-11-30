import { combineReducers } from '@reduxjs/toolkit';

import auth from './auth/reducer';

export const appReducer = combineReducers({
  auth,
});

const rootReducer = (state: any, action: any) => {
  let updatedState = state;
  return appReducer(updatedState, action);
};

export default rootReducer;
