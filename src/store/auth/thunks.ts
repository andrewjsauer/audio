import { createAsyncThunk } from '@reduxjs/toolkit';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

import {
  PartnershipDetailsType,
  UserDataType,
  UserDetailsType,
  PartnerDetailsType,
} from '@lib/types';
import { trackEvent } from '@lib/analytics';
import { signOut } from '@store/app/thunks';

export const submitPhoneNumber = createAsyncThunk<FirebaseAuthTypes.ConfirmationResult, string>(
  'auth/submitPhoneNumber',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      return await auth().signInWithPhoneNumber(phoneNumber);
    } catch (error) {
      trackEvent('submit_phone_number_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const resendCode = createAsyncThunk<FirebaseAuthTypes.ConfirmationResult, string>(
  'auth/resendCode',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      return await auth().signInWithPhoneNumber(phoneNumber, true);
    } catch (error) {
      trackEvent('resend_code_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

interface VerifyCodeArgs {
  confirm: FirebaseAuthTypes.ConfirmationResult;
  code: string;
  phoneNumber: string;
}

export const verifyCode = createAsyncThunk(
  'auth/verifyCode',
  async ({ confirm, code, phoneNumber }: VerifyCodeArgs, { rejectWithValue }) => {
    try {
      await confirm.confirm(code);
      const { currentUser } = auth();

      const userSnapshot = await firestore()
        .collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .get();

      let userData = null;

      if (userSnapshot.empty) {
        trackEvent('verify_code_no_user_found');
      } else {
        const responseData = userSnapshot.docs[0].data() as UserDataType;
        userData = responseData;
      }

      return { user: currentUser, userData };
    } catch (error) {
      trackEvent('verify_code_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

interface GeneratePartnershipArgs {
  userDetails: UserDetailsType;
  partnerDetails: PartnerDetailsType;
  partnershipDetails: PartnershipDetailsType;
}

export const generatePartnership = createAsyncThunk(
  'auth/generatePartnership',
  async (
    { userDetails, partnerDetails, partnershipDetails }: GeneratePartnershipArgs,
    { rejectWithValue },
  ) => {
    try {
      const birthDate = firestore.Timestamp.fromDate(userDetails.birthDate as Date);
      const startDate = firestore.Timestamp.fromDate(partnershipDetails.startDate as Date);

      const { data } = await functions().httpsCallable('generatePartnership')({
        userDetails: {
          ...userDetails,
          birthDate,
        },
        partnerDetails,
        partnershipDetails: {
          ...partnershipDetails,
          startDate,
        },
      });

      const { userPayload, partnerPayload, partnershipPayload } = data;

      return {
        userData: userPayload,
        partnerData: partnerPayload,
        partnershipData: {
          ...partnershipPayload,
          startDate: new Date(partnershipPayload.startDate._seconds * 1000),
        },
      };
    } catch (error) {
      trackEvent('initialize_partnership_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

interface UpdateUserArgs {
  id: string;
  userDetails: UserDataType;
  tempId?: string;
}

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, userDetails }: UpdateUserArgs, { rejectWithValue }) => {
    try {
      await firestore().collection('users').doc(id).set(userDetails, { merge: true });

      return userDetails;
    } catch (error) {
      trackEvent('update_user_data_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const updateNewUser = createAsyncThunk(
  'auth/updateNewUser',
  async ({ id, userDetails, tempId }: UpdateUserArgs, { rejectWithValue }) => {
    const userPayload = {
      ...userDetails,
      birthDate: firestore.Timestamp.fromDate(userDetails.birthDate as Date),
    };

    try {
      const { data } = await functions().httpsCallable('updateNewUser')({
        id,
        userDetails: userPayload,
        tempId,
      });

      return data;
    } catch (error) {
      trackEvent('update_new_user_data_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const deleteRelationship = createAsyncThunk(
  'auth/deleteRelationship',
  async (
    {
      userId,
      partnershipId,
      partnerId,
    }: {
      userId: string;
      partnershipId: string;
      partnerId: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await functions().httpsCallable('deletePartnership')({ partnershipId, userId, partnerId });
      dispatch(signOut({ userId, isDelete: true }));

      return null;
    } catch (error) {
      trackEvent('delete_relationship_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);
