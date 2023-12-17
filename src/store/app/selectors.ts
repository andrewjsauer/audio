export const selectIsLoading = (state: any) => state.app.isLoading;
export const selectError = (state: any) => state.app.error;
export const selectIsPreviouslySubscribed = (state: any) =>
  state.app.isPreviouslySubscribed;
export const selectTransactionError = (state: any) =>
  state.app.transactionError;
