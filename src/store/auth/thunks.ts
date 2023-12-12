import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

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

export const submitPhoneNumber = createAsyncThunk<
  FirebaseAuthTypes.ConfirmationResult,
  string
>('auth/submitPhoneNumber', async (phoneNumber, { rejectWithValue }) => {
  try {
    return await auth().signInWithPhoneNumber(phoneNumber);
  } catch (error) {
    trackEvent('submit_phone_number_error', { error });
    crashlytics().recordError(error);

    return rejectWithValue(error.message);
  }
});

export const resendCode = createAsyncThunk<
  FirebaseAuthTypes.ConfirmationResult,
  string
>('auth/resendCode', async (phoneNumber, { rejectWithValue }) => {
  try {
    return await auth().signInWithPhoneNumber(phoneNumber, true);
  } catch (error) {
    trackEvent('resend_code_error', { error });
    crashlytics().recordError(error);

    return rejectWithValue(error.message);
  }
});

interface VerifyCodeArgs {
  confirm: FirebaseAuthTypes.ConfirmationResult;
  code: string;
  phoneNumber: string;
}

export const verifyCode = createAsyncThunk(
  'auth/verifyCode',
  async (
    { confirm, code, phoneNumber }: VerifyCodeArgs,
    { rejectWithValue },
  ) => {
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
        userData = userSnapshot.docs[0].data() as UserDataType;
      }

      return { user: currentUser, userData };
    } catch (error) {
      trackEvent('verify_code_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

async function sendSmsToPartner(data: {
  inviteName: string;
  invitePhoneNumber: string;
  senderName: string;
}) {
  try {
    await functions().httpsCallable('sendPartnerInvite')(data);
  } catch (error) {
    trackEvent('send_sms_invite_partner_api_error');
    crashlytics().recordError(error);
  }
}

interface InitializePartnershipArgs {
  userDetails: UserDetailsType;
  partnerDetails: PartnerDetailsType;
  partnershipDetails: PartnershipDetailsType;
}

export const initializePartnership = createAsyncThunk(
  'auth/initializePartnership',
  async (
    {
      userDetails,
      partnerDetails,
      partnershipDetails,
    }: InitializePartnershipArgs,
    { rejectWithValue },
  ) => {
    const { type, startDate } = partnershipDetails;

    try {
      const batch = firestore().batch();

      const partnershipId = uuidv4();
      const partnerId = uuidv4();
      const userId = uuidv4();

      const partnershipRef = firestore()
        .collection('partnership')
        .doc(partnershipId);

      const partnershipData = {
        id: partnershipId,
        startDate,
        type,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      batch.set(partnershipRef, partnershipData, { merge: true });

      const partnershipUser1Id = uuidv4();
      const partnershipUserRef1 = firestore()
        .collection('partnershipUser')
        .doc(partnershipUser1Id);

      batch.set(
        partnershipUserRef1,
        {
          id: partnershipUser1Id,
          partnershipId,
          userId,
          otherUserId: partnerId,
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      const partnershipUser2Id = uuidv4();
      const partnershipUserRef2 = firestore()
        .collection('partnershipUser')
        .doc(partnershipUser2Id);
      batch.set(
        partnershipUserRef2,
        {
          id: partnershipUser2Id,
          partnershipId,
          userId: partnerId,
          otherUserId: userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      const userRef = firestore().collection('users').doc(userId);
      const userPayload = {
        ...userDetails,
        createdAt: firestore.FieldValue.serverTimestamp(),
        id: userId,
        isRegistered: true,
        lastActiveAt: firestore.FieldValue.serverTimestamp(),
        partnershipId,
      };
      batch.set(userRef, userPayload, { merge: true });

      const partnerRef = firestore().collection('users').doc(partnerId);
      const partnerPayload = {
        ...partnerDetails,
        createdAt: firestore.FieldValue.serverTimestamp(),
        id: partnerId,
        isRegistered: false,
        lastActiveAt: firestore.FieldValue.serverTimestamp(),
        partnershipId,
      };
      batch.set(partnerRef, partnerPayload, { merge: true });

      await batch.commit();

      await sendSmsToPartner({
        inviteName: partnerDetails.name,
        invitePhoneNumber: partnerDetails.phoneNumber,
        senderName: userDetails.name,
      });

      return { userData: userPayload, partnershipData };
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
}

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, userDetails }: UpdateUserArgs, { rejectWithValue }) => {
    try {
      await firestore()
        .collection('users')
        .doc(id)
        .set(userDetails, { merge: true });

      return userDetails;
    } catch (error) {
      trackEvent('update_user_data_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);
