import { createSelector } from 'reselect';
import { eachDayOfInterval, startOfDay, endOfDay, format } from 'date-fns';

import { QuestionType } from '@lib/types';

export const selectIsLoading = (state) => state.history.isLoading;
export const selectQuestions = (state) => state.history.questions;
export const selectError = (state) => state.history.error;
export const selectLastFailedAction = (state) => state.history.lastFailedAction;

const getMostRecentColor = (questions, colorType: string) => {
  const lastQuestion = questions[questions.length - 1];
  return lastQuestion ? lastQuestion[colorType] : null;
};

const createDefaultQuestion = (date: Date, partnerColor: string, userColor: string) => ({
  createdAt: date,
  id: `default-${date.toISOString()}`,
  partnerAudioUrl: null,
  partnerColor: partnerColor || '#82A326',
  partnerDuration: null,
  partnerReactionToUser: null,
  partnerRecordingId: null,
  partnershipTextKey: 'defaultKey',
  partnerStatus: 'Default',
  text: 'Default Question',
  userAudioUrl: null,
  userColor: userColor || '#175419',
  userDuration: null,
  userReactionToPartner: null,
  userRecordingId: null,
  userStatus: 'Default',
  isBlurred: true,
});

const findMissingDates = (questions: QuestionType[]) => {
  if (questions.length === 0) return [];

  const datesSet = new Set(
    questions.map((q) => format(startOfDay(new Date(q.createdAt)), 'yyyy-MM-dd')),
  );

  const firstDate = startOfDay(new Date(questions[0].createdAt));
  const lastDate = endOfDay(new Date());
  const dateRange = eachDayOfInterval({ start: firstDate, end: lastDate });

  return dateRange.filter((date) => !datesSet.has(format(date, 'yyyy-MM-dd')));
};

export const selectFormattedQuestions = createSelector(selectQuestions, (questions) => {
  const formattedQuestions = questions.map((question) => ({
    ...question,
    createdAt: new Date(question.createdAt),
  }));

  const missingDates = findMissingDates(formattedQuestions);
  const partnerColor = getMostRecentColor(formattedQuestions, 'partnerColor');
  const userColor = getMostRecentColor(formattedQuestions, 'userColor');

  missingDates.forEach((date) => {
    formattedQuestions.push(createDefaultQuestion(date, partnerColor, userColor));
  });

  return formattedQuestions.sort((a, b) => a.createdAt - b.createdAt);
});
