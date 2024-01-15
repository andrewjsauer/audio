import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import i18n from 'i18next';
import moment from 'moment-timezone';

import { PartnershipDataType, QuestionType } from '@lib/types';
import { trackEvent } from '@lib/analytics';
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  formatCreatedAt,
  startOfDayInTimeZone,
} from '@lib/dateUtils';

import { selectCurrentQuestion } from '@store/question/selectors';
import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData, selectPartnershipTimeZone } from '@store/partnership/selectors';

interface FetchLatestQuestionArgs {
  partnershipData: PartnershipDataType;
}

export const calculateQuestionIndex = (createdAt: Date, timeZone: string) => {
  if (!createdAt) return 0;

  const startOfDayCreatedAt = startOfDayInTimeZone(createdAt, timeZone);
  const startOfDayToday = startOfDayInTimeZone(new Date(), timeZone);

  let index = startOfDayToday.diff(startOfDayCreatedAt, 'days');
  index = Math.max(0, index);

  trackEvent('calculate_question_index', {
    today: startOfDayToday,
    createdAt: startOfDayCreatedAt,
    index,
  });

  return index;
};

export const calculateDuration = (startDate: Date, timeZone: string) => {
  if (!startDate) return 'some amount of time';

  const start = moment(startDate);
  const now = moment().tz(timeZone);

  const years = differenceInYears(now, start);
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;

  const months = differenceInMonths(now, start);
  if (months > 0) return `${months} month${months !== 1 ? 's' : ''}`;

  const days = differenceInDays(now, start);
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;

  return 'same day';
};

const formatQuestion = (data: QuestionType, timeZone: string) => ({
  ...data,
  createdAt: formatCreatedAt(data.createdAt, timeZone),
});

const generateQuestion = async ({
  partnerData,
  partnershipData,
  timeZone,
  userData,
  usersLanguage,
}: any) => {
  const questionIndex = calculateQuestionIndex(partnershipData?.createdAt, timeZone);
  trackEvent('generate_question', { questionIndex });

  const payload = {
    questionIndex,
    partnerData,
    userData,
    usersLanguage,
    partnershipData: {
      ...partnershipData,
      startDate: calculateDuration(partnershipData?.startDate, timeZone),
    },
  };

  let data = null;

  try {
    ({ data } = await functions().httpsCallable('generateQuestion')(payload));
    return formatQuestion(data, timeZone);
  } catch (error) {
    trackEvent('question_generation_error', { error });

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
      const today = startOfDayInTimeZone(new Date(), partnershipData.timeZone);

      const userData = selectUserData(state);
      const currentQuestion = selectCurrentQuestion(state);
      const partnerData = selectPartnerData(state);
      const timeZone = selectPartnershipTimeZone(state);
      const currentLanguage = i18n.language;

      if (currentQuestion) {
        const currentQuestionLocalCreatedAt = moment(currentQuestion.createdAt).tz(timeZone);

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
          timeZone,
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
        createdAt: formatCreatedAt(doc.data().createdAt, timeZone),
      };

      const fetchQuestionCreatedAtLocal = moment(fetchedQuestionData.createdAt).tz(timeZone);
      if (fetchQuestionCreatedAtLocal >= today) {
        trackEvent('fetched_desc_question_within_date_limit', {
          fetchedQuestionData,
          today,
        });

        return {
          question: fetchedQuestionData,
          isNewQuestion: true,
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
        timeZone,
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
      trackEvent('question_fetch_error', { error });
      return rejectWithValue(error);
    }
  },
);
