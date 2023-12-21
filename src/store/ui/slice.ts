import { createSlice } from '@reduxjs/toolkit';
import {
  generatePartnership,
  resendCode,
  submitPhoneNumber,
  updateUser,
  verifyCode,
} from '@store/auth/thunks';
import { signOut } from '@store/app/thunks';
import { saveUserRecording } from '@store/recording/thunks';

interface UIState {
  notification: {
    buttonText?: string;
    description: string;
    onButtonPress?: () => void;
    title: string;
    type: 'error' | 'success';
  } | null;
}

const initialState: UIState = {
  notification: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = { ...action.payload };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPhoneNumber.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.phoneNumberAPIError',
          type: 'error',
        };
      })
      .addCase(verifyCode.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.registrationCheckFailed',
          type: 'error',
        };
      })
      .addCase(resendCode.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.resendingVerificationCodeFailed',
          type: 'error',
        };
      })
      .addCase(updateUser.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.userUpdateFailed',
          type: 'error',
        };
      })
      .addCase(generatePartnership.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.partnershipGenerationFailed',
          type: 'error',
        };
      })
      .addCase(signOut.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.signOutFailed',
          type: 'error',
        };
      })
      .addCase(saveUserRecording.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.recordingSaveFailed',
          type: 'error',
        };
      });
  },
});

export const { showNotification, hideNotification } = uiSlice.actions;

export default uiSlice.reducer;
