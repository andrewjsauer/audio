/* eslint-disable no-underscore-dangle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import { startOfDay, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

import { convertDateToLocalStart } from '@lib/dateUtils';
import { PartnershipDataType, UserDataType, QuestionType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

interface FetchLatestQuestionArgs {
  partnerData: UserDataType;
  userData: UserDataType;
  partnershipData: PartnershipDataType;
  currentLanguage: string;
  currentQuestion: QuestionType;
}

const calculateQuestionIndex = (createdAt: Date) => {
  if (!createdAt) return 0;
  const start = convertDateToLocalStart(createdAt);

  const now = startOfDay(new Date());
  const index = differenceInDays(now, start);

  return index;
};

const calculateDuration = (startDate: Date) => {
  if (!startDate) return 'some amount of time';

  const start = startDate?._seconds ? new Date(startDate._seconds * 1000) : new Date(startDate);
  const now = new Date();

  const years = differenceInYears(now, start);
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;

  const months = differenceInMonths(now, start);
  if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`;

  const days = differenceInDays(now, start);
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;

  return 'same day';
};

const formatQuestion = (data: QuestionType) => ({
  ...data,
  createdAt: new Date(data.createdAt._seconds * 1000),
});

const generateQuestion = async ({ partnerData, partnershipData, userData, usersLanguage }: any) => {
  const questionIndex = calculateQuestionIndex(partnershipData.createdAt);

  const payload = {
    questionIndex,
    partnerData,
    userData,
    usersLanguage,
    partnershipData: {
      ...partnershipData,
      startDate: calculateDuration(partnershipData.startDate),
    },
  };

  const { data } = await functions().httpsCallable('generateQuestion')(payload);
  return formatQuestion(data);
};

export const fetchLatestQuestion = createAsyncThunk<
  { question: QuestionType; isNewQuestion: boolean },
  FetchLatestQuestionArgs
>(
  'question/fetchLatestQuestion',
  async (
    {
      currentLanguage,
      currentQuestion,
      partnerData,
      partnershipData,
      userData,
    }: FetchLatestQuestionArgs,
    { rejectWithValue },
  ): any => {
    try {
      const today = startOfDay(new Date());

      if (currentQuestion) {
        const currentQuestionLocalCreatedAt = convertDateToLocalStart(currentQuestion.createdAt);

        if (currentQuestionLocalCreatedAt >= today) {
          trackEvent('current_question_within_date_limit');

          return {
            question: currentQuestion,
            isNewQuestion: false,
          } as {
            question: QuestionType;
            isNewQuestion: boolean;
          };
        }
      }

      const snapshot = await firestore()
        .collection('questions')
        .where('id', '==', partnershipData?.latestQuestionId ?? null)
        .get();

      if (snapshot.empty) {
        trackEvent('fetched_question_not_found');

        const newQuestion = await generateQuestion({
          partnerData,
          partnershipData,
          userData,
          usersLanguage: currentLanguage,
        });

        return {
          question: newQuestion,
          isNewQuestion: true,
        } as {
          question: QuestionType;
          isNewQuestion: boolean;
        };
      }

      const latestQuestion = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt._seconds * 1000),
        };
      })[0];

      const latestQuestionLocalCreatedAt = convertDateToLocalStart(latestQuestion.createdAt);
      if (latestQuestionLocalCreatedAt >= today) {
        trackEvent('question_within_date_limit');

        return {
          question: latestQuestion,
          isNewQuestion: false,
        } as {
          question: QuestionType;
          isNewQuestion: boolean;
        };
      }

      trackEvent('question_out_of_date');
      const newQuestion = await generateQuestion({
        partnerData,
        partnershipData,
        userData,
        usersLanguage: currentLanguage,
      });

      return {
        question: newQuestion,
        isNewQuestion: true,
      } as {
        question: QuestionType;
        isNewQuestion: boolean;
      };
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('question_fetch_error', { error: error.message });

      return rejectWithValue(error.message);
    }
  },
);