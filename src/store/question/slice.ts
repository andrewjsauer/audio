import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { QuestionType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { fetchLatestQuestion } from './thunks';

interface QuestionState {
  currentQuestion: null | QuestionType;
  error: string | null;
  isLoading: boolean;
  lastFailedAction: object | null;
}

const initialState: QuestionState = {
  currentQuestion: null,
  isLoading: false,
  error: null,
  lastFailedAction: null,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    setQuestionData: (state, action: PayloadAction<object | null>) => {
      state.currentQuestion = action.payload as QuestionType;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.currentQuestion = null;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentQuestion = action.payload as QuestionType;
    });
    builder.addCase(fetchLatestQuestion.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLatestQuestion.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.lastFailedAction = {
        type: fetchLatestQuestion.typePrefix,
        payload: action.meta.arg,
      };
    });
  },
});

export const { setQuestionData } = questionSlice.actions;
export default questionSlice.reducer;
