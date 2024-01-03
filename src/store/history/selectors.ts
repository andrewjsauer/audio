import { createSelector } from 'reselect';
import { eachDayOfInterval, startOfDay, endOfDay, format } from 'date-fns';

import { QuestionType } from '@lib/types';

export const selectIsLoading = (state) => state.history.isLoading;
export const selectQuestions = (state) => state.history.questions;
export const selectError = (state) => state.history.error;
export const selectLastFailedAction = (state) => state.history.lastFailedAction;

const sampleQuestions = [
  {
    createdAt: new Date('2023-12-15T00:15:48.000Z'),
    id: Math.random().toString(),
    partnerAudioUrl: null,
    partnerColor: '#937AC8',
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnerStatus: 'PendingRecord',
    partnershipTextKey: 'bothDidNotAnswer',
    questionId: 'e5eaa784-0887-4e7d-a6e8-663015dc0afb',
    text: 'What is your partner incredibly good at?',
    userAudioUrl: null,
    userColor: '#397729',
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: 'Record',
  },
  {
    createdAt: new Date('2023-12-20T00:15:48.000Z'),
    id: Math.random().toString(),
    partnerAudioUrl: null,
    partnerColor: '#937AC8',
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnerStatus: 'Play',
    partnershipTextKey: 'bothDidNotAnswer',
    questionId: 'e5eaa784-0887-4e7d-a6e8-663015dc0afb',
    text: 'What is your partner incredibly good at?',
    userAudioUrl: null,
    userColor: '#397729',
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: 'Play',
  },
  {
    createdAt: new Date('2023-12-25T00:15:48.000Z'),
    id: Math.random().toString(),
    partnerAudioUrl: null,
    partnerColor: '#937AC8',
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnerStatus: 'PendingRecord',
    partnershipTextKey: 'bothDidNotAnswer',
    questionId: 'e5eaa784-0887-4e7d-a6e8-663015dc0afb',
    text: 'What is your partner incredibly good at?',
    userAudioUrl: null,
    userColor: '#397729',
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: 'PendingRecord',
  },
  {
    createdAt: new Date('2024-01-03T00:15:48.000Z'),
    id: Math.random().toString(),
    partnerAudioUrl: null,
    partnerColor: '#937AC8',
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnerStatus: 'Play',
    partnershipTextKey: 'bothDidNotAnswer',
    questionId: 'e5eaa784-0887-4e7d-a6e8-663015dc0afb',
    text: 'What is your partner incredibly good at?',
    userAudioUrl: null,
    userColor: '#397729',
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: 'PendingRecord',
  },
];

const defaultQuestions = [
  'What is your partner incredibly good at?',
  "What's something important you've never told your partner?",
  'What is a fun tradition you would like to start with your partner?',
  'If you could go on any trip next year, what would it be?',
  'If your partner were to gift you a fully "you" day, what would it look like?',
  'What is a small thing your partner does that makes you happy?',
  "What warm childhood memory comes to mind that your partner doesn't know?",
  'What was your first impression of your partner, and how has it changed?',
  'What important lesson has this relationship taught you?',
  'What are some things you find most sexy in your partner?',
  'How have your dynamics changed, grown, or evolved since meeting?',
  'What qualities do you most admire in your partner?',
  'If you could choose any superpower to enhance your relationship, what would it be?',
  'What is something you want more of in your daily life?',
  "If you could pass three of your partner's genes along to your kids, what would they be?",
  'How do you both handle disagreements or conflicts?',
  'What three countries would you love to spend 3+ months in before you die?',
  'What shared goal would you like to achieve with your partner?',
  'What is something you admire about your partner?',
];

const getMostRecentColor = (questions, colorType: string) => {
  const lastQuestion = questions[questions.length - 1];
  return lastQuestion ? lastQuestion[colorType] : null;
};

const createDefaultQuestion = (date: Date, partnerColor: string, userColor: string) => {
  const questionIndex = Math.floor(Math.random() * defaultQuestions.length);
  const question = defaultQuestions[questionIndex];

  return {
    createdAt: date,
    id: Math.random().toString(),
    partnerAudioUrl: null,
    partnerColor: partnerColor || '#82A326',
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnershipTextKey: 'bothDidNotAnswer',
    partnerStatus: 'Lock',
    text: question,
    userAudioUrl: null,
    userColor: userColor || '#175419',
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: 'Lock',
    isItemBlurred: true,
  };
};

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
  const formattedQuestions = questions.map((question) => {
    const isBlurred = question.partnerStatus !== 'Play' && question.userStatus !== 'Play';

    return {
      ...question,
      createdAt: new Date(question.createdAt),
      isItemBlurred: isBlurred,
    };
  });

  const missingDates = findMissingDates(formattedQuestions);
  const partnerColor = getMostRecentColor(formattedQuestions, 'partnerColor');
  const userColor = getMostRecentColor(formattedQuestions, 'userColor');

  missingDates.forEach((date) => {
    formattedQuestions.push(createDefaultQuestion(date, partnerColor, userColor));
  });

  return formattedQuestions.sort((a, b) => b.createdAt - a.createdAt);
});
