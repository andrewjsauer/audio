import { AppState } from './slice';

export const selectIsLoading = (state: AppState) => state.app.isLoading;
export const selectError = (state: AppState) => state.app.error;
export const selectTransactionError = (state: AppState) => state.app.transactionError;
export const selectLastFailedAction = (state: AppState) => state.app.lastFailedAction;
export const selectIsPurchasing = (state: AppState) => state.app.isPurchasing;
