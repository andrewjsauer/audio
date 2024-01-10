import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { signOut, restorePurchases, purchaseProduct, initializeSession } from './thunks';

export interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
  isPurchasing: boolean;
  lastFailedAction: object | null;
  transactionError: string | undefined | null;
  shouldUpdateApp: boolean;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  isPurchasing: false,
  lastFailedAction: null,
  transactionError: null,
  shouldUpdateApp: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
    shouldUpdateAppVersion: (state, action: PayloadAction<boolean>) => {
      state.shouldUpdateApp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, () => {
      return initialState;
    });
    builder.addCase(signOut.pending, (state) => {
      state.error = null;
      state.isLoading = true;
    });
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(initializeSession.fulfilled, (state) => {
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
      state.isPurchasing = true;
    });
    builder.addCase(purchaseProduct.rejected, (state) => {
      state.transactionError = 'errors.purchaseError';
      state.isPurchasing = false;
    });
    builder.addCase(purchaseProduct.fulfilled, (state) => {
      state.isPurchasing = false;
    });
    builder.addCase(restorePurchases.pending, (state) => {
      state.transactionError = null;
      state.isPurchasing = true;
    });
    builder.addCase(restorePurchases.rejected, (state) => {
      state.transactionError = 'errors.restoreError';
      state.isPurchasing = false;
    });
    builder.addCase(restorePurchases.fulfilled, (state) => {
      state.isPurchasing = false;
    });
  },
});

export const { setError, setTransactionError, shouldUpdateAppVersion } = appSlice.actions;
export default appSlice.reducer;
