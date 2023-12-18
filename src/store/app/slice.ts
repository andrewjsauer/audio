import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchPartnerData, fetchPartnership } from '@store/partnership/thunks';
import {
  signOut,
  restorePurchases,
  purchaseProduct,
  initializeSession,
} from './thunks';

export interface AppState {
  error: string | undefined | null;
  loadingCount: number;
  isPreviouslySubscribed: boolean;
  transactionError: string | undefined | null;
  lastFailedAction: object | null;
}

const initialState: AppState = {
  error: null,
  loadingCount: 0,
  isPreviouslySubscribed: false,
  transactionError: null,
  lastFailedAction: null,
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
    const setLoading = (state: AppState, isLoading: boolean) => {
      state.loadingCount += isLoading ? 1 : -1;
    };

    builder.addCase(signOut.fulfilled, (state) => {
      state.error = null;
      state.isPreviouslySubscribed = false;
      setLoading(state, false);
    });
    builder.addCase(signOut.pending, (state) => {
      state.error = null;
      setLoading(state, true);
    });
    builder.addCase(signOut.rejected, (state) => {
      setLoading(state, false);
    });
    builder.addCase(initializeSession.fulfilled, (state, action) => {
      state.isPreviouslySubscribed = action.payload.isPreviouslySubscribed;
      setLoading(state, false);
    });
    builder.addCase(initializeSession.pending, (state) => {
      state.error = null;
      setLoading(state, true);
    });
    builder.addCase(initializeSession.rejected, (state, action) => {
      state.error = action.payload as string;
      state.lastFailedAction = {
        type: initializeSession.typePrefix,
        payload: action.meta.arg,
      };

      setLoading(state, false);
    });
    builder.addCase(purchaseProduct.pending, (state) => {
      state.transactionError = null;
      setLoading(state, true);
    });
    builder.addCase(purchaseProduct.rejected, (state, action) => {
      state.transactionError = action.payload as string;
      setLoading(state, false);
    });
    builder.addCase(purchaseProduct.fulfilled, (state) => {
      setLoading(state, false);
    });
    builder.addCase(restorePurchases.pending, (state) => {
      state.transactionError = null;
      setLoading(state, true);
    });
    builder.addCase(restorePurchases.rejected, (state, action) => {
      state.transactionError = action.payload as string;
      setLoading(state, false);
    });
    builder.addCase(restorePurchases.fulfilled, (state) => {
      setLoading(state, false);
    });
    builder.addCase(fetchPartnerData.fulfilled, (state) => {
      setLoading(state, false);
    });
    builder.addCase(fetchPartnerData.rejected, (state, action) => {
      state.error = action.payload as string;
      state.lastFailedAction = {
        type: fetchPartnerData.typePrefix,
        payload: action.meta.arg,
      };

      setLoading(state, false);
    });
    builder.addCase(fetchPartnerData.pending, (state) => {
      setLoading(state, true);
    });
    builder.addCase(fetchPartnership.fulfilled, (state) => {
      setLoading(state, false);
    });
    builder.addCase(fetchPartnership.rejected, (state, action) => {
      state.error = action.payload as string;
      state.lastFailedAction = {
        type: fetchPartnership.typePrefix,
        payload: action.meta.arg,
      };

      setLoading(state, false);
    });
    builder.addCase(fetchPartnership.pending, (state) => {
      setLoading(state, true);
    });
  },
});

export const { setError } = appSlice.actions;
export default appSlice.reducer;
