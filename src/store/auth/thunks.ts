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

interface GeneratePartnershipArgs {
  userDetails: UserDetailsType;
  partnerDetails: PartnerDetailsType;
  partnershipDetails: PartnershipDetailsType;
  userId: string;
}

export const generatePartnership = createAsyncThunk(
  'auth/generatePartnership',
  async (
    {
      userDetails,
      partnerDetails,
      partnershipDetails,
      userId,
    }: GeneratePartnershipArgs,
    { rejectWithValue },
  ) => {
    const { type, startDate } = partnershipDetails;

    try {
      const batch = firestore().batch();

      const partnershipId = uuidv4();
      const tempPartnerId = uuidv4();

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
          otherUserId: tempPartnerId,
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
          userId: tempPartnerId,
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

      const partnerRef = firestore().collection('users').doc(tempPartnerId);
      const partnerPayload = {
        ...partnerDetails,
        createdAt: firestore.FieldValue.serverTimestamp(),
        id: tempPartnerId,
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
  tempId?: string;
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

export const updateNewUser = createAsyncThunk(
  'auth/updateNewUser',
  async ({ id, userDetails, tempId }: UpdateUserArgs, { rejectWithValue }) => {
    const db = firestore();
    const batch = db.batch();

    try {
      const usersCollection = db.collection('users');
      const tempDocRef = usersCollection.doc(tempId);
      const tempDoc = await tempDocRef.get();

      if (tempDoc.exists) {
        const newUserRef = usersCollection.doc(id);
        batch.set(
          newUserRef,
          { ...tempDoc.data(), ...userDetails, id },
          { merge: true },
        );
        batch.delete(tempDocRef);
      } else {
        return rejectWithValue('Temp user not found');
      }

      const partnershipUserRef = db.collection('partnershipUser');
      const pUserQuery = partnershipUserRef.where('userId', '==', tempId);
      const pUserSnapshot = await pUserQuery.get();

      if (!pUserSnapshot.empty) {
        const partnershipDocRef = pUserSnapshot.docs[0].ref;
        batch.set(partnershipDocRef, { userId: id }, { merge: true });
      } else {
        return rejectWithValue('Temp partnership user not found');
      }

      const pUserPartnerQuery = partnershipUserRef.where(
        'otherUserId',
        '==',
        tempId,
      );
      const pUserPartnerSnapshot = await pUserPartnerQuery.get();

      if (!pUserPartnerSnapshot.empty) {
        const partnershipPartnerDocRef = pUserPartnerSnapshot.docs[0].ref;
        batch.set(
          partnershipPartnerDocRef,
          { otherUserId: id },
          { merge: true },
        );
      } else {
        return rejectWithValue('Temp partnership partners user not found');
      }

      await batch.commit(); // Commit the batch
      return userDetails;
    } catch (error) {
      trackEvent('update_new_user_data_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);
