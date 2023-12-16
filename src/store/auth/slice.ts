import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { UserDataType } from '@lib/types';

import { signOut } from '@store/app/thunks';
import {
  generatePartnership,
  getUsersEntitlements,
  resendCode,
  submitPhoneNumber,
  updateNewUser,
  updateUser,
  verifyCode,
} from './thunks';

interface AuthState {
  code: string;
  confirm: FirebaseAuthTypes.ConfirmationResult | null;
  error: string | null;
  isLoading: boolean;
  user: FirebaseAuthTypes.User | null;
  userData: UserDataType | null;
  isSubscriber: boolean;
}

const initialState: AuthState = {
  code: '',
  confirm: null,
  error: null,
  isLoading: false,
  user: null,
  userData: null,
  isSubscriber: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseAuthTypes.User>) => {
      state.user = action.payload;
    },
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setConfirm: (
      state,
      action: PayloadAction<FirebaseAuthTypes.ConfirmationResult>,
    ) => {
      state.confirm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.confirm = null;
        state.user = null;
        state.userData = null;
        state.code = '';
      })
      .addCase(submitPhoneNumber.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitPhoneNumber.fulfilled, (state, action) => {
        state.confirm = action.payload;
        state.isLoading = false;
      })
      .addCase(submitPhoneNumber.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(resendCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendCode.fulfilled, (state, action) => {
        state.confirm = action.payload;
        state.isLoading = false;
      })
      .addCase(resendCode.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(verifyCode.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyCode.fulfilled, (state, action) => {
        state.userData = action.payload.userData as UserDataType;
        state.user = action.payload.user as FirebaseAuthTypes.User;
        state.isLoading = false;
      })
      .addCase(verifyCode.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(generatePartnership.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generatePartnership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload.userData as UserDataType;
      })
      .addCase(generatePartnership.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = {
          ...state.userData,
          ...action.payload,
        } as UserDataType;
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateNewUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNewUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = {
          ...state.userData,
          ...action.payload,
        } as UserDataType;
      })
      .addCase(updateNewUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getUsersEntitlements.fulfilled, (state, action) => {
        state.isSubscriber = action.payload.isSubscriber;
      });
  },
});

export const { setCode, setUser, setConfirm } = authSlice.actions;
export default authSlice.reducer;
