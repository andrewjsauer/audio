import { createAsyncThunk } from '@reduxjs/toolkit';

import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';

import { trackEvent } from '@lib/analytics';
import {
  PartnershipDetailsType,
  PartnershipDataType,
  PartnershipUserDataType,
  UserDataType,
} from '@lib/types';

export const updatePartnership = createAsyncThunk(
  'partnership/updatePartnership',
  async (
    {
      id,
      partnershipDetails,
    }: {
      id: string;
      partnershipDetails: PartnershipDetailsType;
    },
    { rejectWithValue },
  ) => {
    try {
      await firestore().collection('partnership').doc(id).set(partnershipDetails, { merge: true });
      return partnershipDetails;
    } catch (error) {
      trackEvent('update_partnership_failed', { error: error.message });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnership = createAsyncThunk(
  'partnership/fetchPartnership',
  async (partnershipId: string, { rejectWithValue }) => {
    try {
      const partnershipSnapshot = await firestore()
        .collection('partnership')
        .doc(partnershipId)
        .get();

      if (partnershipSnapshot.exists) {
        trackEvent('partnership_fetched');

        const partnershipData = partnershipSnapshot.data();
        const payload = {
          ...partnershipData,
          startDate: new Date(partnershipData.startDate._seconds * 1000),
          createdAt: new Date(partnershipData.createdAt._seconds * 1000),
        };

        return payload as PartnershipDataType;
      }

      trackEvent('partnership_not_found');
      return rejectWithValue('Partnership not found');
    } catch (error) {
      trackEvent('partnership_fetch_error', { error: error.message });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

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
        return partnershipUserData as PartnershipUserDataType;
      }

      trackEvent('partnership_user_not_found');
      return null;
    } catch (error) {
      trackEvent('partnership_user_fetch_error', { error: error.message });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);

export const fetchPartnerData = createAsyncThunk(
  'partnership/fetchPartnerData',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const partnershipUserResponse = await dispatch(fetchPartnershipUser(userId));

      if (fetchPartnershipUser.fulfilled.match(partnershipUserResponse)) {
        const partnershipUserData = partnershipUserResponse.payload as PartnershipUserDataType;
        const partnerId = partnershipUserData.otherUserId;

        const partnerSnapshot = await firestore().collection('users').doc(partnerId).get();

        if (partnerSnapshot.exists) {
          trackEvent('partnership_data_fetched');
          return partnerSnapshot.data() as UserDataType;
        }
      } else {
        trackEvent('partnership_data_not_found');
      }

      return null;
    } catch (error) {
      trackEvent('partnership_data_fetch_error', { error: error.message });
      crashlytics().recordError(error);
      return rejectWithValue(error.message);
    }
  },
);
