import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { QuestionType } from '@lib/types';
import { signOut } from '@store/app/thunks';

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
  reducers: {
    setQuestion: (state, action: PayloadAction<QuestionType | null>) => {
      state.currentQuestion = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.currentQuestion = null;
      state.isLoading = false;
    });
  },
});

export const { setQuestion, setLoading } = questionSlice.actions;
export default questionSlice.reducer;
