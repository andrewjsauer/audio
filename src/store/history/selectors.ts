import { createSelector } from 'reselect';
import moment from 'moment-timezone';

import { QuestionType } from '@lib/types';
import { selectPartnershipTimeZone } from '@store/partnership/selectors';

export const selectIsLoading = (state) => state.history.isLoading;
export const selectQuestions = (state) => state.history.questions;
export const selectLastDocSnapshot = (state) => state.history.lastDocSnapshot;
export const selectError = (state) => state.history.error;
export const selectLastFailedAction = (state) => state.history.lastFailedAction;

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

const getMostRecentColor = (questions: any[], colorType: string) => {
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

const findMissingDates = (questions: QuestionType[], timeZone: string) => {
  if (questions.length === 0) return [];

  const datesSet = new Set(
    questions.map((q) => moment.tz(q.createdAt, timeZone).startOf('day').format('YYYY-MM-DD')),
  );

  const firstDate = moment.tz(questions[0].createdAt, timeZone).startOf('day');
  const lastDate = moment.tz(timeZone).endOf('day');
  const dateRange = [];

  for (let m = moment(firstDate); m.isBefore(lastDate); m.add(1, 'days')) {
    dateRange.push(m.clone());
  }

  return dateRange.filter((date) => !datesSet.has(date.format('YYYY-MM-DD')));
};

export const selectFormattedQuestions = createSelector(
  selectQuestions,
  selectPartnershipTimeZone,
  (questions, timeZone) => {
    const formattedQuestions = questions.map((question) => {
      const isBlurred = question.partnerStatus !== 'Play' && question.userStatus !== 'Play';

      return {
        ...question,
        createdAt: question.createdAt,
        isItemBlurred: isBlurred,
      };
    });

    const missingDates = findMissingDates(formattedQuestions, timeZone);
    const partnerColor = getMostRecentColor(formattedQuestions, 'partnerColor');
    const userColor = getMostRecentColor(formattedQuestions, 'userColor');

    missingDates.forEach((date) => {
      formattedQuestions.push(createDefaultQuestion(date.toDate(), partnerColor, userColor));
    });

    return formattedQuestions.sort((a, b) =>
      moment(b.createdAt).tz(timeZone).diff(moment(a.createdAt).tz(timeZone)),
    );
  },
);
