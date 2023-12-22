import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PartnershipDataType, UserDataType as PartnerDataType, PartnershipUserDataType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { fetchLatestQuestion } from '@store/question/thunks';
import { generatePartnership } from '@store/auth/thunks';
import { fetchPartnerData, updatePartnershipUser, fetchPartnership } from './thunks';

interface PartnershipState {
  error: string | undefined | null;
  isLoadingPartnerData: boolean;
  isLoadingPartnershipData: boolean;
  lastFailedAction: object | null;
  partnerData: PartnerDataType | null;
  partnershipData: PartnershipDataType | null;
  partnershipUserData: PartnershipUserDataType | null;
}

const initialState: PartnershipState = {
  error: null,
  isLoadingPartnerData: false,
  isLoadingPartnershipData: false,
  lastFailedAction: null,
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
      state.error = null;
      state.isLoadingPartnerData = false;
      state.isLoadingPartnershipData = false;
      state.lastFailedAction = null;
      state.partnerData = null;
      state.partnershipData = null;
      state.partnershipUserData = null;
    });
    builder.addCase(generatePartnership.fulfilled, (state, action) => {
      state.partnershipData = action.payload.partnershipData as PartnershipDataType;
    });
    builder.addCase(updatePartnershipUser.fulfilled, (state, action) => {
      state.partnershipUserData = {
        ...state.partnershipUserData,
        ...action.payload,
      };
    });
    builder.addCase(fetchPartnership.pending, (state) => {
      state.isLoadingPartnershipData = true;
      state.error = null;
    });
    builder.addCase(fetchPartnership.rejected, (state, action) => {
      state.isLoadingPartnershipData = false;
      state.error = 'errors.fetchPartnershipDataAPIError';
      state.lastFailedAction = {
        type: fetchPartnership.typePrefix,
        payload: action.meta.arg,
      };
    });
    builder.addCase(fetchPartnership.fulfilled, (state, action) => {
      state.isLoadingPartnershipData = false;
      state.partnershipData = action.payload as PartnershipDataType;
    });
    builder.addCase(fetchPartnerData.pending, (state) => {
      state.isLoadingPartnerData = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerData.fulfilled, (state, action) => {
      state.partnerData = action.payload as PartnerDataType;
      state.isLoadingPartnerData = false;
    });
    builder.addCase(fetchPartnerData.rejected, (state, action) => {
      state.isLoadingPartnerData = false;
      state.error = 'errors.fetchPartnerDataAPIError';
      state.lastFailedAction = {
        type: fetchPartnerData.typePrefix,
        payload: action.meta.arg,
      };
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      state.partnershipData = {
        ...state.partnershipData,
        latestQuestionId: action.payload.id,
      };
    });
    builder.addCase(fetchLatestQuestion.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchLatestQuestion.rejected, (state, action) => {
      state.error = 'errors.fetchQuestionAPIError';
      state.lastFailedAction = {
        type: fetchLatestQuestion.typePrefix,
        payload: action.meta.arg,
      };
    });
  },
});

export const { setPartnershipData } = partnershipSlice.actions;
export default partnershipSlice.reducer;
