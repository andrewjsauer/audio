import { createSlice } from '@reduxjs/toolkit';

import { HistoryType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { saveListeningReaction } from '@store/recording/thunks';
import { fetchHistoryData, fetchMoreHistoryData } from './thunks';

interface HistoryState {
  error: string | undefined | null;
  isEndReached: boolean;
  isLoading: boolean;
  lastDocData?: object | null;
  lastFailedAction: object | null;
  questions: HistoryType[];
}

const initialState: HistoryState = {
  error: null,
  isEndReached: false,
  isLoading: false,
  lastDocData: null,
  lastFailedAction: null,
  questions: [],
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
        state.isEndReached = action.payload.lastDocData === null;
        state.isLoading = false;
        state.lastDocData = action.payload.lastDocData;
        state.questions = action.payload.questions;
      })
      .addCase(fetchMoreHistoryData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastFailedAction = null;
      })
      .addCase(fetchMoreHistoryData.fulfilled, (state, action) => {
        state.isEndReached = action.payload.lastDocData === null;
        state.isLoading = false;
        state.lastDocData = action.payload.lastDocData;
        state.questions = [...state.questions, ...action.payload.questions];
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
