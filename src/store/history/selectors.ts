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

// Determines if a question is considered "answered"
const isQuestionAnswered = (question) =>
  question.partnerStatus === 'Play' && question.userStatus === 'Play';

// Finds dates without questions or with unanswered questions
const findDatesForDefaultQuestions = (questions, timeZone) => {
  if (questions.length === 0) {
    return [moment.tz(timeZone).startOf('day')]; // Return today if no questions
  }

  const datesWithUnansweredQuestions = questions
    .filter((q) => !isQuestionAnswered(q))
    .map((q) => moment.tz(q.createdAt, timeZone).startOf('day'));

  const uniqueDates = new Set(
    datesWithUnansweredQuestions.map((date) => date.format('YYYY-MM-DD')),
  );

  return Array.from(uniqueDates).map((dateStr) => moment(dateStr, 'YYYY-MM-DD'));
};

export const selectFormattedQuestions = createSelector(
  selectQuestions,
  selectPartnershipTimeZone,
  (questions, timeZone) => {
    // Mark questions as blurred based on their answer status
    const formattedQuestions = questions.map((question) => ({
      ...question,
      isItemBlurred: !isQuestionAnswered(question),
    }));

    // Identify dates that require a default question
    const datesForDefaultQuestions = findDatesForDefaultQuestions(formattedQuestions, timeZone);
    const mostRecentColors = {
      partnerColor: getMostRecentColor(formattedQuestions, 'partnerColor'),
      userColor: getMostRecentColor(formattedQuestions, 'userColor'),
    };

    // Add default questions for dates without an answered question
    datesForDefaultQuestions.forEach((date) => {
      if (!formattedQuestions.some((q) => moment(q.createdAt).isSame(date, 'day'))) {
        formattedQuestions.push(
          createDefaultQuestion(date, mostRecentColors.partnerColor, mostRecentColors.userColor),
        );
      }
    });

    // Sort questions by date
    return formattedQuestions.sort((a, b) =>
      moment(b.createdAt).tz(timeZone).diff(moment(a.createdAt).tz(timeZone)),
    );
  },
);
