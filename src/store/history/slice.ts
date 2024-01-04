import { createSlice } from '@reduxjs/toolkit';

import { HistoryType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { saveListeningReaction } from '@store/recording/thunks';
import { fetchHistoryData, fetchMoreHistoryData } from './thunks';

interface HistoryState {
  error: string | undefined | null;
  isLoading: boolean;
  questions: HistoryType[];
  lastFailedAction: object | null;
  lastDocSnapshot?: object | null;
}

const initialState: HistoryState = {
  error: null,
  isLoading: false,
  lastFailedAction: null,
  questions: [],
  lastDocSnapshot: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signOut.fulfilled, () => {
        return initialState;
      })
      .addCase(fetchHistoryData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastFailedAction = null;
        state.questions = [];
      })
      .addCase(fetchHistoryData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload.questions;
        state.lastDocSnapshot = action.payload.lastDocSnapshot;
      })
      .addCase(fetchMoreHistoryData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastFailedAction = null;
      })
      .addCase(fetchMoreHistoryData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = [...state.questions, ...action.payload.questions];
        state.lastDocSnapshot = action.payload.lastDocSnapshot;
      })
      .addCase(fetchMoreHistoryData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = 'errors.historyAPIError';
        state.lastFailedAction = {
          type: fetchMoreHistoryData.typePrefix,
          payload: action.meta.arg,
        };
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = 'errors.historyAPIError';
        state.lastFailedAction = {
          type: fetchHistoryData.typePrefix,
          payload: action.meta.arg,
        };
      })
      .addCase(saveListeningReaction.fulfilled, (state, action) => {
        const { questionId, reaction } = action.payload;

        const questionIndex = state.questions.findIndex((q) => q.id === questionId);

        if (questionIndex !== -1) {
          state.questions[questionIndex].userReactionToPartner = reaction;
        }
      });
  },
});

export default historySlice.reducer;
