import { createAsyncThunk } from '@reduxjs/toolkit';

import firestore from '@react-native-firebase/firestore';

import { trackEvent } from '@lib/analytics';
import { formatCreatedAt } from '@lib/dateUtils';
import { PartnershipDataType, PartnershipUserDataType, UserDataType } from '@lib/types';

import { selectPartnershipTimeZone } from '@store/partnership/selectors';

export const updatePartnership = createAsyncThunk(
  'partnership/updatePartnership',
  async (
    {
      id,
      partnershipDetails,
    }: {
      id: string;
      partnershipDetails: PartnershipDataType;
    },
    { rejectWithValue },
  ) => {
    try {
      await firestore().collection('partnership').doc(id).set(partnershipDetails, { merge: true });
      return partnershipDetails;
    } catch (error) {
      trackEvent('update_partnership_failed', { error });
      return rejectWithValue(error);
    }
  },
);

export const fetchPartnership = createAsyncThunk(
  'partnership/fetchPartnership',
  async (partnershipId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const timeZone = selectPartnershipTimeZone(state);

      const partnershipSnapshot = await firestore()
        .collection('partnership')
        .doc(partnershipId)
        .get();

      if (partnershipSnapshot.exists) {
        trackEvent('partnership_fetched');

        const partnershipData = partnershipSnapshot.data();
        const payload = {
          ...partnershipData,
          startDate: formatCreatedAt(partnershipData.startDate, timeZone),
          createdAt: formatCreatedAt(partnershipData.createdAt, timeZone),
        };

        return payload as PartnershipDataType;
      }

      trackEvent('partnership_not_found');
      return rejectWithValue('Partnership not found');
    } catch (error) {
      trackEvent('partnership_fetch_error', { error });
      return rejectWithValue(error);
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
      trackEvent('partnership_user_fetch_error', { error });
      return rejectWithValue(error);
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
      trackEvent('partnership_data_fetch_error', { error });
      return rejectWithValue(error);
    }
  },
);
