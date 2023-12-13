import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';

import { trackEvent } from '@lib/analytics';
import { UserDataType as PartnerDataType } from '@lib/types';

export const fetchPartnerData = createAsyncThunk(
  'partnership/fetchPartnerData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const partnershipSnapshot = await firestore()
        .collection('partnershipUser')
        .where('userId', '==', userId)
        .get();

      if (!partnershipSnapshot.empty) {
        const partnershipData = partnershipSnapshot.docs[0].data();
        const partnerId = partnershipData.otherUserId;

        const partnerSnapshot = await firestore()
          .collection('users')
          .doc(partnerId)
          .get();

        if (partnerSnapshot.exists) {
          trackEvent('partnership_data_fetched');
          return partnerSnapshot.data() as PartnerDataType;
        }
      }

      trackEvent('partnership_data_not_found');
      return rejectWithValue('No partner data found');
    } catch (error) {
      trackEvent('partnership_data_fetch_error', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error);
    }
  },
);
