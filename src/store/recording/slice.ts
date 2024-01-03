import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RecordingType, ListeningType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import { fetchLatestQuestion } from '@store/question/thunks';

import { saveUserRecording } from './thunks';

interface RecordingState {
  isLoading: boolean;
  partnerReactionToUser: ListeningType | null;
  partnerRecording: RecordingType | null;
  userReactionToPartner: ListeningType | null;
  userRecording: RecordingType | null;
}

const initialState: RecordingState = {
  isLoading: false,
  partnerReactionToUser: null,
  partnerRecording: null,
  userReactionToPartner: null,
  userRecording: null,
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    setPartnerRecording: (state, action: PayloadAction<RecordingType | null>) => {
      state.partnerRecording = action.payload;
    },
    setUserRecording: (state, action: PayloadAction<RecordingType | null>) => {
      state.userRecording = action.payload;
    },
    setUserReactionToPartner: (state, action: PayloadAction<ListeningType | null>) => {
      state.userReactionToPartner = action.payload;
    },
    setPartnerReactionToUser: (state, action: PayloadAction<ListeningType | null>) => {
      state.partnerReactionToUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.partnerReactionToUser = null;
      state.partnerRecording = null;
      state.userReactionToPartner = null;
      state.userRecording = null;
    });
    builder.addCase(saveUserRecording.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userRecording = action.payload;
    });
    builder.addCase(saveUserRecording.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(saveUserRecording.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(fetchLatestQuestion.fulfilled, (state, action) => {
      if (action.payload.isNewQuestion) {
        state.partnerReactionToUser = null;
        state.partnerRecording = null;
        state.userReactionToPartner = null;
        state.userRecording = null;
      }
    });
  },
});

export const {
  setUserRecording,
  setPartnerRecording,
  setUserReactionToPartner,
  setPartnerReactionToUser,
} = recordingSlice.actions;
export default recordingSlice.reducer;
