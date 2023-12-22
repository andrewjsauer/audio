import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { signOut, restorePurchases, purchaseProduct, initializeSession } from './thunks';

export interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
  isPreviouslySubscribed: boolean;
  lastFailedAction: object | null;
  transactionError: string | undefined | null;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  isPreviouslySubscribed: false,
  lastFailedAction: null,
  transactionError: null,
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
      state.error = null;
      state.isLoading = false;
      state.isPreviouslySubscribed = false;
      state.lastFailedAction = null;
      state.transactionError = null;
    });
    builder.addCase(signOut.pending, (state) => {
      state.error = null;
      state.isLoading = true;
    });
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(initializeSession.fulfilled, (state, action) => {
      state.isPreviouslySubscribed = action.payload.isPreviouslySubscribed;
      state.isLoading = false;
    });
    builder.addCase(initializeSession.pending, (state) => {
      state.error = null;
      state.isLoading = true;
      state.lastFailedAction = null;
    });
    builder.addCase(initializeSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = 'errors.initSessionAPIError';
      state.lastFailedAction = {
        type: initializeSession.typePrefix,
        payload: action.meta.arg,
      };
    });
    builder.addCase(purchaseProduct.pending, (state) => {
      state.transactionError = null;
      state.isLoading = true;
    });
    builder.addCase(purchaseProduct.rejected, (state) => {
      state.transactionError = 'errors.purchaseError';
      state.isLoading = false;
    });
    builder.addCase(purchaseProduct.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(restorePurchases.pending, (state) => {
      state.transactionError = null;
      state.isLoading = true;
    });
    builder.addCase(restorePurchases.rejected, (state) => {
      state.transactionError = 'errors.restoreError';
      state.isLoading = false;
    });
    builder.addCase(restorePurchases.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export const { setError } = appSlice.actions;
export default appSlice.reducer;
