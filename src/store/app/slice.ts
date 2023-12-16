import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { signOut, initializeSession } from './thunks';

interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
  isPreviouslySubscribed: boolean;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  isPreviouslySubscribed: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
      state.isPreviouslySubscribed = false;
    });
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(initializeSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isPreviouslySubscribed = action.payload.isPreviouslySubscribed;
    });
    builder.addCase(initializeSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initializeSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setError } = appSlice.actions;
export default appSlice.reducer;
