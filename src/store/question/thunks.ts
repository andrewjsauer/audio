import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';

import { PartnershipDataType, QuestionType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

export const fetchLatestQuestion = createAsyncThunk<
  QuestionType,
  PartnershipDataType
>(
  'question/fetchLatestQuestion',
  async (partnershipData, { rejectWithValue }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const snapshot = await firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipData.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        trackEvent('question_not_found');

        const generateQuestionResponse = await functions().httpsCallable(
          'generateQuestion',
        )({ partnershipData });

        return generateQuestionResponse.data;
      }

      const latestQuestion = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))[0];

      if (latestQuestion.createdAt.toDate() >= today) {
        trackEvent('question_within_date_limit');
        return latestQuestion;
      }

      trackEvent('question_out_of_date');
      const generateQuestionResponse = await functions().httpsCallable(
        'generateQuestion',
      )({ partnershipData });

      return generateQuestionResponse.data;
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('question_fetch_error', { error: error.message });

      return rejectWithValue(error.message);
    }
  },
);
