import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  PartnershipDataType,
  UserDataType as PartnerDataType,
  PartnershipUserDataType,
} from '@lib/types';

import { signOut, initializeSubscriber } from '@store/app/thunks';
import { generatePartnership } from '@store/auth/thunks';
import { fetchLatestQuestion } from '@store/question/thunks';
import { updatePartnership } from './thunks';

interface PartnershipState {
  error: string | undefined | null;
  isLoading: boolean;
  lastFailedAction: object | null;
  partnerData: PartnerDataType | null;
  partnershipData: PartnershipDataType | null;
  partnershipUserData: PartnershipUserDataType | null;
}

const initialState: PartnershipState = {
  error: null,
  isLoading: false,
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
    setPartnershipUserData: (state, action: PayloadAction<object | null>) => {
      state.partnershipUserData = action.payload as PartnershipUserDataType;
    },
    setPartnerData: (state, action: PayloadAction<object | null>) => {
      state.partnerData = action.payload as PartnerDataType;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, () => {
      return initialState;
    });
    builder.addCase(generatePartnership.fulfilled, (state, action) => {
      state.partnershipData = action.payload.partnershipData as PartnershipDataType;
      state.partnerData = action.payload.partnerData as PartnerDataType;
    });
    builder.addCase(fetchLatestQuestion.pending, (state) => {
      state.error = null;
      state.lastFailedAction = null;
    });
    builder.addCase(fetchLatestQuestion.rejected, (state, action) => {
      state.error = 'errors.fetchQuestionAPIError';
      state.lastFailedAction = {
        type: fetchLatestQuestion.typePrefix,
        payload: action.meta.arg,
      };
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      state.partnershipData = {
        ...state.partnershipData,
        latestQuestionId: action.payload.question.id,
      };
    });
    builder.addCase(updatePartnership.pending, (state) => {
      state.error = null;
      state.lastFailedAction = null;
      state.isLoading = true;
    });
    builder.addCase(updatePartnership.rejected, (state, action) => {
      state.error = 'errors.updatePartnershipAPIError';
      state.isLoading = false;
      state.lastFailedAction = {
        type: updatePartnership.typePrefix,
        payload: action.meta.arg,
      };
    });
    builder.addCase(updatePartnership.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(initializeSubscriber.fulfilled, (state, action) => {
      state.partnershipData = action.payload.partnershipData as PartnershipDataType;
    });
  },
});

export const { setError, setPartnershipData, setPartnerData, setPartnershipUserData } =
  partnershipSlice.actions;
export default partnershipSlice.reducer;
