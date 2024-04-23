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
import { selectAreBothRecordingsAvailable } from '@store/recording/selectors';
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

  try {
    const { data } = await functions().httpsCallable('fetchQuestionModified')(payload);
    return {
      question: {
        ...data.question,
        createdAt: formatCreatedAt(data.question.createdAt, timeZone),
      },
      isNewQuestion: data.isNewQuestion,
    };
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
      const now = moment().tz(partnershipData.timeZone);
      const today = startOfDayInTimeZone(new Date(), partnershipData.timeZone);

      const userData = selectUserData(state);
      const areBothRecordingsAvailable = selectAreBothRecordingsAvailable(state);
      const currentQuestion = selectCurrentQuestion(state);
      const partnerData = selectPartnerData(state);
      const timeZone = selectPartnershipTimeZone(state);
      const currentLanguage = i18n.language;

      if (currentQuestion) {
        const currentQuestionLocalCreatedAt = moment(currentQuestion.createdAt).tz(timeZone);
        const isSameDay = now.isSame(currentQuestionLocalCreatedAt, 'day');

        if (!areBothRecordingsAvailable) {
          trackEvent('No Recordings Available Persist Question', {
            currentQuestion,
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

        if (areBothRecordingsAvailable && isSameDay) {
          trackEvent('Recordings Available Same Day Persist Question', {
            currentQuestion,
            today,
          });
          return {
            question: currentQuestion,
            isNewQuestion: false,
          };
        }
      }

      trackEvent('Requesting Question');

      const payload = await generateQuestion({
        partnerData,
        partnershipData,
        timeZone,
        userData,
        usersLanguage: currentLanguage,
      });

      if (!payload) {
        trackEvent('Generate Question Failed');
        return rejectWithValue('Generate Question Failed');
      }

      const { question, isNewQuestion }: any = payload;
      trackEvent('Viewing Question', { ...question });

      return {
        question,
        isNewQuestion,
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
