import { createSlice } from '@reduxjs/toolkit';
import {
  generatePartnership,
  resendCode,
  submitPhoneNumber,
  updateUser,
  verifyCode,
  deleteRelationship,
} from '@store/auth/thunks';
import { signOut } from '@store/app/thunks';
import { saveUserRecording } from '@store/recording/thunks';
import { updatePartnership } from '@store/partnership/thunks';

interface UIState {
  notification: {
    buttonText?: string;
    description?: string;
    onButtonPress?: () => void;
    title: string;
    type: 'error' | 'success';
    duration?: string;
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
    builder.addCase(signOut.fulfilled, () => {
      return initialState;
    });
    builder
      .addCase(submitPhoneNumber.rejected, (state, action) => {
        state.notification = {
          title: action.payload?.title || 'errors.pleaseTryAgain',
          description: action.payload?.description || 'errors.phoneNumberAPIError',
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
      .addCase(generatePartnership.rejected, (state, action) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: action.payload?.message as string,
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
      .addCase(saveUserRecording.rejected, (state, action) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: action.payload as string,
          type: 'error',
        };
      })
      .addCase(deleteRelationship.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.deleteRelationshipFailed',
          type: 'error',
        };
      })
      .addCase(updatePartnership.fulfilled, (state) => {
        state.notification = {
          title: 'accountScreen.partnershipUpdateSuccess',
          type: 'success',
        };
      })
      .addCase(updatePartnership.rejected, (state) => {
        state.notification = {
          title: 'errors.pleaseTryAgain',
          description: 'errors.updatePartnershipFailed',
          type: 'error',
        };
      });
  },
});

export const { showNotification, hideNotification } = uiSlice.actions;

export default uiSlice.reducer;
