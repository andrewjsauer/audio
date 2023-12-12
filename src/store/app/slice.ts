import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { signOut } from './thunks';

interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
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
    });
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { setError } = appSlice.actions;
export default appSlice.reducer;
