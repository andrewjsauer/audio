/* eslint-disable no-underscore-dangle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import { startOfDay, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import i18n from 'i18next';

import { convertDateToLocal } from '@lib/dateUtils';
import { PartnershipDataType, QuestionType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

import { selectCurrentQuestion } from '@store/question/selectors';
import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

interface FetchLatestQuestionArgs {
  partnershipData: PartnershipDataType;
}

export const calculateQuestionIndex = (createdAt: Date) => {
  if (!createdAt) return 0;

  const createdAtLocal = convertDateToLocal(createdAt);

  const startOfDayUTC = startOfDay(new Date());
  const today = convertDateToLocal(startOfDayUTC);

  const diffInMillis = today - createdAtLocal;
  let index = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
  index = Math.max(0, index);

  trackEvent('calculate_question_index', { createdAtLocal, createdAt, index });
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
  const questionIndex = calculateQuestionIndex(partnershipData?.createdAt);

  const payload = {
    questionIndex,
    partnerData,
    userData,
    usersLanguage,
    partnershipData: {
      ...partnershipData,
      startDate: calculateDuration(partnershipData?.startDate),
    },
  };

  let data = null;

  try {
    ({ data } = await functions().httpsCallable('generateQuestion')(payload));
    return formatQuestion(data);
  } catch (error) {
    crashlytics().recordError(error);
    trackEvent('question_generation_error', { error: error.message });

    return null;
  }
};

export const fetchLatestQuestion = createAsyncThunk<
  { question: QuestionType; isNewQuestion: boolean },
  FetchLatestQuestionArgs
>(
  'question/fetchLatestQuestion',
  async ({ partnershipData }: FetchLatestQuestionArgs, { rejectWithValue, getState }): any => {
    try {
      const state = getState();
      const startOfDayUTC = startOfDay(new Date());
      const today = convertDateToLocal(startOfDayUTC);

      const userData = selectUserData(state);
      const currentQuestion = selectCurrentQuestion(state);
      const partnerData = selectPartnerData(state);
      const currentLanguage = i18n.language;

      if (currentQuestion) {
        const currentQuestionLocalCreatedAt = convertDateToLocal(currentQuestion.createdAt);

        if (currentQuestionLocalCreatedAt >= today) {
          trackEvent('current_question_within_date_limit', {
            currentQuestion,
            currentQuestionLocalCreatedAt,
            today,
          });

          return {
            question: currentQuestion,
            isNewQuestion: false,
          } as {
            question: QuestionType;
            isNewQuestion: boolean;
          };
        }

        trackEvent('current_question_out_of_date', {
          currentQuestion,
          currentQuestionLocalCreatedAt,
          today,
        });
      }

      const queriedDescQuestionSnapshot = await firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipData?.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (queriedDescQuestionSnapshot.empty) {
        trackEvent('fetched_desc_question_not_found');

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

      const doc = queriedDescQuestionSnapshot.docs[0];
      const fetchedQuestionData = {
        ...doc.data(),
        id: doc.id,
        createdAt: new Date(doc.data().createdAt._seconds * 1000),
      };

      const fetchQuestionCreatedAtLocal = convertDateToLocal(fetchedQuestionData.createdAt);
      if (fetchQuestionCreatedAtLocal >= today) {
        trackEvent('fetched_desc_question_within_date_limit', {
          fetchedQuestionData,
          today,
        });

        return {
          question: fetchedQuestionData,
          isNewQuestion: false,
        } as {
          question: QuestionType;
          isNewQuestion: boolean;
        };
      }

      trackEvent('fetched_desc_question_out_of_date', {
        fetchQuestionCreatedAtLocal,
        fetchedQuestionData,
        today,
      });

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
