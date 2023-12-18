export const selectIsLoading = (state) => state.question.isLoading;
export const selectCurrentQuestion = (state) => state.question.currentQuestion;
export const selectError = (state) => state.question.error;
export const selectLastFailedAction = (state) =>
  state.question.lastFailedAction;
