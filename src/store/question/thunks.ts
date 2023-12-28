/* eslint-disable no-underscore-dangle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import { startOfDay } from 'date-fns';

import { PartnershipDataType, UserDataType, QuestionType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

interface FetchLatestQuestionArgs {
  partnerData: UserDataType;
  userData: UserDataType;
  partnershipData: PartnershipDataType;
  currentLanguage: string;
}

export const fetchLatestQuestion = createAsyncThunk<QuestionType, FetchLatestQuestionArgs>(
  'question/fetchLatestQuestion',
  async (
    { partnershipData, partnerData, userData, currentLanguage }: FetchLatestQuestionArgs,
    { rejectWithValue },
  ) => {
    try {
      const today = startOfDay(new Date());

      const snapshot = await firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipData.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        trackEvent('question_not_found');

        const { data } = await functions().httpsCallable('generateQuestion')({
          partnerData,
          partnershipData,
          userData,
          usersLanguage: currentLanguage,
        });

        const question = {
          ...data,
          createdAt: new Date(data.createdAt._seconds * 1000),
        };

        return question;
      }

      const latestQuestion = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt._seconds * 1000),
        };
      })[0];

      if (latestQuestion.createdAt >= today) {
        trackEvent('question_within_date_limit');
        return latestQuestion;
      }

      trackEvent('question_out_of_date');
      const { data } = await functions().httpsCallable('generateQuestion')({
        partnershipData,
        partnerData,
        userData,
      });

      const question = {
        ...data,
        createdAt: new Date(data.createdAt._seconds * 1000),
      };

      return question;
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('question_fetch_error', { error: error.message });

      return rejectWithValue(error.message);
    }
  },
);
