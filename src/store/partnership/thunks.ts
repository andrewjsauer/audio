import { createAsyncThunk } from '@reduxjs/toolkit';

import crashlytics from '@react-native-firebase/crashlytics';
import firestore from '@react-native-firebase/firestore';

import { trackEvent } from '@lib/analytics';
import { PartnershipDetailsType } from '@lib/types';

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
      trackEvent('update_partnership_failed', { error });
      crashlytics().recordError(error);

      return rejectWithValue(error.message);
    }
  },
);
