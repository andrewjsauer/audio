import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchPartnerData } from '@store/partnership/thunks';
import {
  signOut,
  restorePurchases,
  purchaseProduct,
  initializeSession,
} from './thunks';

interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
  isLoadingPartnerData: boolean;
  isPreviouslySubscribed: boolean;
  transactionError: string | undefined | null;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  isLoadingPartnerData: false,
  isPreviouslySubscribed: false,
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
      state.isLoading = false;
      state.error = null;
      state.isPreviouslySubscribed = false;
    });
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
      state.error = null;
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
      state.error = null;
    });
    builder.addCase(initializeSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    builder.addCase(purchaseProduct.pending, (state) => {
      state.isLoading = true;
      state.transactionError = null;
    });
    builder.addCase(purchaseProduct.rejected, (state, action) => {
      state.isLoading = false;
      state.transactionError = action.payload as string;
    });
    builder.addCase(purchaseProduct.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(restorePurchases.pending, (state) => {
      state.isLoading = true;
      state.transactionError = null;
    });
    builder.addCase(restorePurchases.rejected, (state, action) => {
      state.isLoading = false;
      state.transactionError = action.payload as string;
    });
    builder.addCase(restorePurchases.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(fetchPartnerData.fulfilled, (state) => {
      state.isLoadingPartnerData = false;
    });
    builder.addCase(fetchPartnerData.rejected, (state, action) => {
      state.isLoadingPartnerData = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchPartnerData.pending, (state) => {
      state.isLoadingPartnerData = true;
    });
  },
});

export const { setError } = appSlice.actions;
export default appSlice.reducer;
