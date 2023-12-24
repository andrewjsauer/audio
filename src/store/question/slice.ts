import { createSlice } from '@reduxjs/toolkit';

import { QuestionType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { fetchLatestQuestion } from './thunks';

interface QuestionState {
  currentQuestion: null | QuestionType;
  isLoading: boolean;
}

const initialState: QuestionState = {
  currentQuestion: null,
  isLoading: false,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.currentQuestion = null;
      state.isLoading = false;
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentQuestion = action.payload as QuestionType;
    });
    builder.addCase(fetchLatestQuestion.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchLatestQuestion.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export default questionSlice.reducer;
