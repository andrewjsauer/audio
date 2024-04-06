import { createSelector } from 'reselect';
import moment from 'moment-timezone';

import { selectPartnershipTimeZone } from '@store/partnership/selectors';

export const selectError = (state) => state.history.error;
export const selectIsLoading = (state) => state.history.isLoading;
export const selectLastDocData = (state) => state.history.lastDocData;
export const selectLastFailedAction = (state) => state.history.lastFailedAction;
export const selectQuestions = (state) => state.history.questions;
export const selectIsEndReached = (state) => state.history.isEndReached;

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

const getRandomDefaultQuestion = () => {
  const questionIndex = Math.floor(Math.random() * defaultQuestions.length);
  return defaultQuestions[questionIndex];
};

const createDefaultQuestion = (date, partnerColor = '#82A326', userColor = '#175419') => ({
  createdAt: date.toISOString(),
  id: Math.random().toString(),
  partnerAudioUrl: null,
  partnerColor,
  partnerDuration: null,
  partnerReactionToUser: null,
  partnerRecordingId: null,
  partnershipTextKey: 'bothDidNotAnswer',
  partnerStatus: 'Lock',
  text: getRandomDefaultQuestion(),
  userAudioUrl: null,
  userColor,
  userDuration: null,
  userReactionToPartner: null,
  userRecordingId: null,
  userStatus: 'Lock',
  isItemBlurred: true,
});

const isQuestionAnswered = (question) =>
  question.partnerStatus === 'Play' && question.userStatus === 'Play';

const findDatesForDefaultQuestions = (questions, timeZone) => {
  const today = moment.tz(timeZone).startOf('day');
  const dates = [];

  // Process questions, starting from the second one
  questions.slice(1).forEach((q) => {
    const questionDate = moment.tz(q.createdAt, timeZone).startOf('day');
    if (!dates.some((date) => date.isSame(questionDate, 'day')) && !isQuestionAnswered(q)) {
      dates.push(questionDate);
    }
  });

  // Always include today's date first
  return [today].concat(dates.sort((a, b) => a.diff(b)));
};

export const selectFormattedQuestions = createSelector(
  selectQuestions,
  selectPartnershipTimeZone,
  (questions, timeZone) => {
    const today = moment.tz(timeZone).startOf('day');

    const formattedQuestions = questions.map((question, index) => ({
      ...question,
      createdAt: index === 0 ? moment.tz(timeZone).toISOString() : question.createdAt,
      isItemBlurred: !isQuestionAnswered(question),
    }));

    const datesForDefaultQuestions = findDatesForDefaultQuestions(formattedQuestions, timeZone);
    const mostRecentColors = {
      partnerColor: getMostRecentColor(formattedQuestions, 'partnerColor'),
      userColor: getMostRecentColor(formattedQuestions, 'userColor'),
    };

    datesForDefaultQuestions.forEach((date, index) => {
      if (
        index > 0 &&
        !formattedQuestions.some((q) => moment.tz(q.createdAt, timeZone).isSame(date, 'day'))
      ) {
        formattedQuestions.push(
          createDefaultQuestion(date, mostRecentColors.partnerColor, mostRecentColors.userColor),
        );
      }
    });

    // Sort questions to keep today's question at the top and order the rest by date
    const sortedQuestions = formattedQuestions.sort((a, b) => {
      const dateA = moment.tz(a.createdAt, timeZone);
      const dateB = moment.tz(b.createdAt, timeZone);
      if (dateA.isSame(today, 'day')) return -1; // Always bring today's question to the top
      if (dateB.isSame(today, 'day')) return 1; // Push any other question for today down if encountered (should not happen with logic above)
      return dateA.diff(dateB); // Sort the rest by their dates
    });

    return sortedQuestions;
  },
);
