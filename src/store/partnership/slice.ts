import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PartnershipDataType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { initializePartnership } from '@store/auth/thunks';

interface PartnershipState {
  error: string | undefined | null;
  isLoading: boolean;
  partnershipData: PartnershipDataType | null;
}

const initialState: PartnershipState = {
  error: null,
  isLoading: false,
  partnershipData: null,
};

const partnershipSlice = createSlice({
  name: 'partnership',
  initialState,
  reducers: {
    setPartnershipData: (state, action: PayloadAction<object | null>) => {
      state.partnershipData = action.payload as PartnershipDataType;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.partnershipData = null;
    });
    builder.addCase(initializePartnership.fulfilled, (state, action) => {
      state.partnershipData = action.payload
        .partnershipData as PartnershipDataType;
    });
  },
});

export const { setPartnershipData } = partnershipSlice.actions;
export default partnershipSlice.reducer;
