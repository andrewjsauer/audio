import { createSelector } from 'reselect';

import { selectPartnershipData } from '@store/partnership/selectors';
import { selectUserRecording } from '@store/recording/selectors';
import { calculateQuestionIndex } from '@store/question/thunks';

import { AppState } from './slice';

export const selectIsLoading = (state: AppState) => state.app.isLoading;
export const selectError = (state: AppState) => state.app.error;
export const selectTransactionError = (state: AppState) => state.app.transactionError;
export const selectLastFailedAction = (state: AppState) => state.app.lastFailedAction;
export const selectIsPurchasing = (state: AppState) => state.app.isPurchasing;
export const selectShouldUpdateApp = (state: AppState) => state.app.shouldUpdateApp;

export const selectShouldShowPrivateReminder = createSelector(
  selectPartnershipData,
  selectUserRecording,
  (partnershipData, userRecording) => {
    if (!partnershipData || !partnershipData?.createdAt || !partnershipData?.timeZone) {
      return false;
    }

    const { createdAt, timeZone } = partnershipData;

    const daysJoined = calculateQuestionIndex(createdAt, timeZone);
    return daysJoined === 0 && !userRecording;
  },
);
