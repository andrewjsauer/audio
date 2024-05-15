import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { QuestionType } from '@lib/types';
import { signOut, initializeSubscriber } from '@store/app/thunks';

import { fetchLatestQuestion, updateQuestionSkipped } from './thunks';

interface QuestionState {
  currentQuestion: null | QuestionType;
  isInitializing: boolean;
  isLoading: boolean;
  isUpdatingSkipped: boolean;
}

const initialState: QuestionState = {
  currentQuestion: null,
  isInitializing: false,
  isLoading: false,
  isUpdatingSkipped: false,
};

const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    setQuestion: (state, action: PayloadAction<QuestionType | null>) => {
      state.currentQuestion = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, () => {
      return initialState;
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentQuestion = action.payload.question;
    });
    builder.addCase(fetchLatestQuestion.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchLatestQuestion.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(initializeSubscriber.fulfilled, (state) => {
      state.isInitializing = false;
    });
    builder.addCase(initializeSubscriber.pending, (state) => {
      state.isInitializing = true;
    });
    builder.addCase(initializeSubscriber.rejected, (state) => {
      state.isInitializing = false;
    });
    builder.addCase(updateQuestionSkipped.pending, (state) => {
      state.isUpdatingSkipped = true;
    });
    builder.addCase(updateQuestionSkipped.fulfilled, (state) => {
      state.isUpdatingSkipped = false;
      state.currentQuestion = {
        ...state.currentQuestion!,
        isSkipped: true,
      };
    });
    builder.addCase(updateQuestionSkipped.rejected, (state) => {
      state.isUpdatingSkipped = false;
    });
  },
});

export const { setQuestion, setLoading } = questionSlice.actions;
export default questionSlice.reducer;
