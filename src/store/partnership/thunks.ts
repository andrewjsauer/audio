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
      trackEvent('Update Partnership Failed', { error });
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
        const partnershipData = partnershipSnapshot.data();
        const payload = {
          ...partnershipData,
          startDate: formatCreatedAt(partnershipData.startDate, timeZone),
          createdAt: formatCreatedAt(partnershipData.createdAt, timeZone),
        };

        return payload as PartnershipDataType;
      }

      trackEvent('Partnership Not Found');
      return rejectWithValue('Partnership not found');
    } catch (error) {
      trackEvent('Fetch Partnership Failed', { error });
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
        const partnershipUserData = partnershipUserSnapshot.docs[0].data();
        return partnershipUserData as PartnershipUserDataType;
      }

      trackEvent('Partnership User Not Found');
      return null;
    } catch (error) {
      trackEvent('Fetch Partnership User Failed', { error });
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
          return partnerSnapshot.data() as UserDataType;
        }
      } else {
        trackEvent('Partner Data Not Found');
      }

      return null;
    } catch (error) {
      trackEvent('Fetch Partner Data Failed', { error });
      return rejectWithValue(error);
    }
  },
);
