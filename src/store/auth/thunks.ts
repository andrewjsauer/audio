import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTimeZone } from 'react-native-localize';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

import {
  PartnershipDetailsType,
  UserDataType,
  UserDetailsType,
  PartnerDetailsType,
} from '@lib/types';
import { trackEvent, initializeAnalytics } from '@lib/analytics';
import { formatCreatedAt } from '@lib/dateUtils';

import { signOut, initializeSubscriber } from '@store/app/thunks';

export const submitPhoneNumber = createAsyncThunk<FirebaseAuthTypes.ConfirmationResult, string>(
  'auth/submitPhoneNumber',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      return await auth().signInWithPhoneNumber(phoneNumber);
    } catch (error) {
      trackEvent('Submit Phone Number Failed', { error });

      const errorMessage = error?.toString();
      if (
        errorMessage?.includes('too many attempts') ||
        errorMessage?.includes('We have blocked all requests')
      ) {
        return rejectWithValue({
          title: 'errors.pleaseTryAgainLater',
          description: 'errors.tooManyAttempts',
        });
      }

      return rejectWithValue({
        title: 'errors.pleaseTryAgain',
        description: 'errors.phoneNumberAPIError',
      });
    }
  },
);

export const resendCode = createAsyncThunk<FirebaseAuthTypes.ConfirmationResult, string>(
  'auth/resendCode',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      return await auth().signInWithPhoneNumber(phoneNumber, true);
    } catch (error) {
      trackEvent('Resend Code Failed', { error });
      return rejectWithValue(error);
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
  async ({ confirm, code, phoneNumber }: VerifyCodeArgs, { rejectWithValue, dispatch }) => {
    try {
      await confirm.confirm(code);
      const { currentUser } = auth();

      const userSnapshot = await firestore()
        .collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .get();

      let userData = null;

      if (userSnapshot.empty) {
        trackEvent('Verify Code User Not Found');
      } else {
        const responseData = userSnapshot.docs[0].data() as UserDataType;
        userData = responseData;

        if (
          responseData?.isRegistered &&
          responseData?.isSubscribed &&
          responseData?.hasSubscribed
        ) {
          const resultAction = await dispatch(initializeSubscriber(userData));

          if (initializeSubscriber.fulfilled.match(resultAction)) {
            trackEvent('Initialized Registered Subscriber');
          } else if (initializeSubscriber.rejected.match(resultAction)) {
            trackEvent('Initialized Register Subscriber Failed', { error: resultAction.payload });
          }
        }
      }

      initializeAnalytics(userData);
      return { user: currentUser, userData };
    } catch (error) {
      trackEvent('Verify Code Error', { error });
      return rejectWithValue(error);
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
      const timeZone = getTimeZone();
      const birthDate = firestore.Timestamp.fromDate(userDetails.birthDate as Date);
      const startDate = firestore.Timestamp.fromDate(partnershipDetails.startDate as Date);
      const usersName = userDetails.name?.trim();
      const partnersName = partnerDetails.name?.trim();

      const { data } = await functions().httpsCallable('generatePartnership')({
        userDetails: {
          ...userDetails,
          birthDate,
          name: usersName,
        },
        partnerDetails: {
          ...partnerDetails,
          name: partnersName,
        },
        partnershipDetails: {
          ...partnershipDetails,
          startDate,
          timeZone,
        },
      });

      const { userPayload, partnerPayload, partnershipPayload } = data;
      console.log('userPayload', userPayload);
      console.log('partnerPayload', partnerPayload);
      console.log('partnershipPayload', partnershipPayload);

      return {
        userData: userPayload,
        partnerData: partnerPayload,
        partnershipData: {
          ...partnershipPayload,
          createdAt: formatCreatedAt(partnershipPayload.createdAt, timeZone),
          startDate: formatCreatedAt(partnershipPayload.startDate, timeZone),
        },
      };
    } catch (error) {
      const errorMessage = error?.toString();
      if (errorMessage && errorMessage.includes('Partner already has a partner')) {
        return rejectWithValue('errors.partnerAlreadyInUse');
      }

      trackEvent('Generate Partnership Failed', { error });
      return rejectWithValue('errors.partnershipGenerationFailed');
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
      trackEvent('Update User Failed', { error });
      return rejectWithValue(error);
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

      const partnershipSnapshot = await firestore()
        .collection('partnership')
        .where('id', '==', data.partnershipId)
        .get();

      let partnershipData = null;

      if (partnershipSnapshot.empty) {
        trackEvent('No Partnership Found for Partner User');
      } else {
        const responseData = partnershipSnapshot.docs[0].data() as PartnershipDetailsType;
        partnershipData = responseData;
      }

      return {
        userData: data,
        partnershipData,
      };
    } catch (error) {
      trackEvent('Update New User Failed', { error });
      return rejectWithValue(error);
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
      trackEvent('Delete Relationship Failed', { error });
      return rejectWithValue(error);
    }
  },
);
