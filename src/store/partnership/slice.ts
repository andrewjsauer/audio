import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  PartnershipDataType,
  UserDataType as PartnerDataType,
  PartnershipUserDataType,
} from '@lib/types';

import { signOut } from '@store/app/thunks';
import { generatePartnership } from '@store/auth/thunks';
import { fetchPartnerData, updatePartnershipUser } from './thunks';

interface PartnershipState {
  partnerData: PartnerDataType | null;
  partnershipData: PartnershipDataType | null;
  partnershipUserData: PartnershipUserDataType | null;
}

const initialState: PartnershipState = {
  partnerData: null,
  partnershipData: null,
  partnershipUserData: null,
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
      state.partnershipUserData = null;
      state.partnerData = null;
    });
    builder.addCase(generatePartnership.fulfilled, (state, action) => {
      state.partnershipData = action.payload
        .partnershipData as PartnershipDataType;
    });
    builder.addCase(fetchPartnerData.fulfilled, (state, action) => {
      state.partnerData = action.payload as PartnerDataType;
    });
    builder.addCase(updatePartnershipUser.fulfilled, (state, action) => {
      state.partnershipUserData = {
        ...state.partnershipUserData,
        ...action.payload,
      };
    });
  },
});

export const { setPartnershipData } = partnershipSlice.actions;
export default partnershipSlice.reducer;
