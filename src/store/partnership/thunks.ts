import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';

import { trackEvent } from '@lib/analytics';
import {
  UserDataType as PartnerDataType,
  PartnershipUserDataType,
} from '@lib/types';

export const fetchPartnershipUser = createAsyncThunk(
  'partnership/fetchPartnershipUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const partnershipUserSnapshot = await firestore()
        .collection('partnershipUser')
        .where('userId', '==', userId)
        .get();

      if (!partnershipUserSnapshot.empty) {
        trackEvent('partnership_user_fetched');

        const partnershipUserData = partnershipUserSnapshot.docs[0].data();
        console.log('TEST partnershipUserData', partnershipUserData);

        return partnershipUserData as PartnershipUserDataType;
      }

      trackEvent('partnership_user_not_found');
      return rejectWithValue('No partnership user found');
    } catch (error) {
      trackEvent('partnership_user_fetch_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error);
    }
  },
);

interface UpdatePartnershipUserArgs {
  id: string;
  partnershipUserData: PartnershipUserDataType;
}

export const updatePartnershipUser = createAsyncThunk(
  'partnership/updatePartnershipUser',
  async (
    { id, partnershipUserData }: UpdatePartnershipUserArgs,
    { rejectWithValue },
  ) => {
    try {
      await firestore()
        .collection('partnershipUser')
        .doc(id)
        .set(partnershipUserData, { merge: true });

      return partnershipUserData;
    } catch (error) {
      trackEvent('partnership_user_fetch_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnerData = createAsyncThunk(
  'partnership/fetchPartnerData',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const partnershipUserResponse = await dispatch(
        fetchPartnershipUser(userId),
      );

      console.log('TEST partnershipUserResponse', partnershipUserResponse);

      if (
        partnershipUserResponse.type === fetchPartnershipUser.fulfilled.type
      ) {
        const partnershipUserData =
          partnershipUserResponse.payload as PartnershipUserDataType;
        const partnerId = partnershipUserData.otherUserId;

        const partnerSnapshot = await firestore()
          .collection('users')
          .doc(partnerId)
          .get();

        console.log('partnerSnapshot.exists', partnerSnapshot.exists);

        if (partnerSnapshot.exists) {
          trackEvent('partnership_data_fetched');
          console.log('TEST partnerSnapshot.data()', partnerSnapshot.data());

          return partnerSnapshot.data() as PartnerDataType;
        }
      } else {
        trackEvent('partnership_data_not_found');
        return rejectWithValue('Failed to fetch partnership user');
      }
    } catch (error) {
      trackEvent('partnership_data_fetch_error', { error });
      crashlytics().recordError(error);
      return rejectWithValue(error);
    }
  },
);
