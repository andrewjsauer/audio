import { createSelector } from 'reselect';

import { selectIsSubscribed } from '@store/auth/selectors';
import { AppState } from './slice';

export const selectIsLoading = (state: AppState) => state.app.loadingCount > 0;
export const selectError = (state: AppState) => state.app.error;
export const selectIsPreviouslySubscribedValue = (state: AppState) =>
  state.app.isPreviouslySubscribed;
export const selectTransactionError = (state: AppState) => state.app.transactionError;
export const selectLastFailedAction = (state: AppState) => state.app.lastFailedAction;

export const selectIsPreviouslySubscribed = createSelector(
  selectIsSubscribed,
  selectIsPreviouslySubscribedValue,
  (isSubscribed, isPreviouslySubscribed) => {
    return isSubscribed || isPreviouslySubscribed;
  },
);
