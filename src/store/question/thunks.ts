import { createAsyncThunk } from '@reduxjs/toolkit';
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

  const payload = {
    questionIndex,
    partnerData,
    userData,
    usersLanguage,
    partnershipData: {
      ...partnershipData,
      startDate: calculateDuration(partnershipData.startDate, timeZone),
    },
  };

  let data = null;

  try {
    ({ data } = await functions().httpsCallable('generateQuestionModified')(payload));
    return formatQuestion(data, timeZone);
  } catch (error) {
    trackEvent('Generate Question Failed', { error });

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
          trackEvent('Question Current', {
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

        trackEvent('Current Question Expired', {
          currentQuestion,
          currentQuestionLocalCreatedAt,
          today,
        });
      }

      const newQuestion = await generateQuestion({
        partnerData,
        partnershipData,
        timeZone,
        userData,
        usersLanguage: currentLanguage,
      });

      trackEvent('Question Viewed', { ...newQuestion });

      return {
        question: newQuestion,
        isNewQuestion: true,
      } as {
        question: QuestionType;
        isNewQuestion: boolean;
      };
    } catch (error) {
      trackEvent('Fetch Latest Question Failed', { error });
      return rejectWithValue(error);
    }
  },
);
