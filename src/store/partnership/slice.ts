import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  PartnershipDataType,
  UserDataType as PartnerDataType,
} from '@lib/types';

import { signOut } from '@store/app/thunks';
import { initializePartnership } from '@store/auth/thunks';
import { fetchPartnerData } from './thunks';

interface PartnershipState {
  partnerData: PartnerDataType | null;
  partnershipData: PartnershipDataType | null;
}

const initialState: PartnershipState = {
  partnershipData: null,
  partnerData: null,
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
      state.partnershipData = null;
    });
    builder.addCase(initializePartnership.fulfilled, (state, action) => {
      state.partnershipData = action.payload
        .partnershipData as PartnershipDataType;
    });
    builder.addCase(fetchPartnerData.fulfilled, (state, action) => {
      state.partnerData = action.payload as PartnerDataType;
    });
  },
});

export const { setPartnershipData } = partnershipSlice.actions;
export default partnershipSlice.reducer;
