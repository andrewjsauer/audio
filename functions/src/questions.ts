import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';

import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import moment from 'moment-timezone';

import defaultQuestions from './utils/questions';
import { trackEvent } from './analytics';

import { startOfDayInTimeZone, formatCreatedAt } from './utils/dateUtils';

const openApiKey = defineSecret('OPEN_AI_API_KEY');

type RelationshipType =
  | 'stillGettingToKnowEachOther'
  | 'dating'
  | 'inARelationship'
  | 'engaged'
  | 'domesticPartnership'
  | 'cohabiting'
  | 'longDistanceRelationship'
  | 'consensualNonMonogamousRelationship'
  | 'inAnOpenRelationship'
  | 'married';

const languageMap: { [key: string]: string } = {
  en: 'English',
  es: 'Spanish',
  zhCN: 'Simplified Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
  bn: 'Bengali',
  pt: 'Portuguese',
  ru: 'Russian',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  it: 'Italian',
};

const relationshipTypeMap: { [key in RelationshipType]: string } = {
  stillGettingToKnowEachOther: 'a couple who are still getting to know each other',
  dating: 'a couple who are just dating',
  inARelationship: 'a couple who is in relationship',
  engaged: 'a couple who is engaged',
  domesticPartnership: 'a domestic partnership couple',
  cohabiting: 'a cohabiting couple',
  longDistanceRelationship: 'a long distance couple',
  consensualNonMonogamousRelationship: 'a consensual non-monogamous relationship',
  inAnOpenRelationship: 'a couple in an open relationship',
  married: 'a married couple',
};

const shouldGenerateNewQuestion = async (partnershipId: string) => {
  const db = admin.firestore();

  const latestQuestion = await db
    .collection('questions')
    .where('partnershipId', '==', partnershipId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (latestQuestion.empty) {
    functions.logger.info('No questions found for this partnership.');
    return false;
  }

  const didUserSkipLatestQuestion = latestQuestion.docs[0].data().isSkipped || false;
  if (didUserSkipLatestQuestion) {
    functions.logger.info('User skipped the latest question.');
    return true;
  }

  const latestQuestionId = latestQuestion.docs[0].id;

  const recordingsSnapshot = await db
    .collection('recordings')
    .where('questionId', '==', latestQuestionId)
    .get();

  if (recordingsSnapshot.empty) {
    functions.logger.info('No recordings found for this question.');
    return false;
  }

  let recordingCount = 0;

  recordingsSnapshot.forEach(() => {
    recordingCount += 1;
  });

  return recordingCount === 2;
};

async function getPreviousPartnershipQuestions(partnershipId: string) {
  const db = admin.firestore();
  const questionsRef = db.collection('questions');
  const snapshot = await questionsRef
    .where('partnershipId', '==', partnershipId)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  if (snapshot.empty) {
    functions.logger.info('No questions found for this partnership.');
    return [];
  }

  const lastTenQuestions: string[] = [];
  snapshot.forEach((doc) => {
    const questionData = doc.data();
    lastTenQuestions.push(questionData.text);
  });

  return lastTenQuestions;
}

type generatePersonalizedQuestionParams = {
  partnership: {
    id: string;
    type: RelationshipType;
    startDate: Date;
    timeZone: string;
  };
  usersLanguage: string;
  openai: OpenAI;
};

const generatePersonalizedQuestion = async ({
  partnership,
  usersLanguage,
  openai,
}: generatePersonalizedQuestionParams): Promise<string> => {
  let questionText;

  try {
    const relationshipType = relationshipTypeMap[partnership.type as RelationshipType];

    const adjectives = ['thoughtful', 'playful', 'fun'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const promptLanguage =
      usersLanguage === 'en' ? '' : ` in ${languageMap[usersLanguage] || 'English'}`;

    const pastQuestions = await getPreviousPartnershipQuestions(partnership.id);

    let systemPrompt = `You are an AI designed to generate ${randomAdjective} and engaging daily questions for couples. Your questions should encourage meaningful conversations and help couples learn more about each other. Ensure that each question is clear, concise, and roughly 90 characters in length.`;
    const prompt = `Create a daily question${promptLanguage} for ${relationshipType} that is engaging, thoughtful, and roughly 90 characters long.`;

    if (pastQuestions.length > 0) {
      systemPrompt += ` Avoid previous questions: ${pastQuestions.join(', ')}.`;
    }

    functions.logger.info(`Personalized Prompt: ${prompt}`);

    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o',
    });

    const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
    questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
  } catch (error: unknown) {
    functions.logger.error(`Error with OpenAI request: ${JSON.stringify(error)}`);

    const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
    questionText = defaultQuestions[backupIndex];
  }

  return questionText as string;
};

export const fetchQuestion = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const { questionIndex, partnershipData, userData, usersLanguage } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const db = admin.firestore();

    const queriedDescQuestionSnapshot = await db
      .collection('questions')
      .where('partnershipId', '==', partnershipData.id)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!queriedDescQuestionSnapshot.empty) {
      const doc = queriedDescQuestionSnapshot.docs[0];
      const fetchedQuestionData = doc.data();

      functions.logger.info(`Persisting question: ${JSON.stringify(fetchedQuestionData)}`);
      return fetchedQuestionData;
    }

    functions.logger.log('Generating New Question');
    trackEvent('Generating New Question', userData.id);

    let questionText;

    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

    if (
      partnershipData.id === '538e11b4-061e-489f-ae52-3bddb0cafe1d' ||
      partnershipData.id === 'f12665bc-b969-4877-9c6d-54ef5c23d86f'
    ) {
      questionText = await generatePersonalizedQuestion({
        partnership: partnershipData,
        usersLanguage,
        openai,
      });
    } else if (questionIndex >= 0 && questionIndex < defaultQuestions.length) {
      const englishQuestion = defaultQuestions[questionIndex];

      if (usersLanguage !== 'en') {
        try {
          const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: `Convert the following question prompt into ${languageMap[usersLanguage]}`,
              },
              { role: 'user', content: englishQuestion },
            ],
            model: 'gpt-3.5-turbo',
          });

          const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
          questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
        } catch (error) {
          functions.logger.error(`Error translating with OpenAI request: ${JSON.stringify(error)}`);

          const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
          questionText = defaultQuestions[backupIndex];
        }
      } else {
        questionText = englishQuestion;
      }
    } else {
      questionText = await generatePersonalizedQuestion({
        partnership: partnershipData,
        usersLanguage,
        openai,
      });
    }

    const questionId = uuidv4();
    const question = {
      id: questionId,
      partnershipId: partnershipData.id,
      text: questionText,
      createdAt: admin.firestore.Timestamp.now(),
    };

    try {
      const batch = db.batch();
      batch.set(
        db.collection('partnership').doc(partnershipData.id),
        {
          latestQuestionId: questionId,
        },
        { merge: true },
      );

      batch.set(db.collection('questions').doc(questionId), question, {
        merge: true,
      });

      await batch.commit();
    } catch (error) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);
        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${error}`,
          error,
        );
      }
    }

    return question;
  });

export const fetchQuestionModified = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const { questionIndex, partnershipData, userData, usersLanguage } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const db = admin.firestore();

    const queriedDescQuestionSnapshot = await db
      .collection('questions')
      .where('partnershipId', '==', partnershipData.id)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!queriedDescQuestionSnapshot.empty) {
      const doc = queriedDescQuestionSnapshot.docs[0];
      const fetchedQuestionData = doc.data();

      functions.logger.info(`Persisting question: ${JSON.stringify(fetchedQuestionData)}`);
      return {
        question: fetchedQuestionData,
        isNewQuestion: false,
      };
    }

    functions.logger.log('Generating New Question');
    trackEvent('Generating New Question', userData.id);

    let questionText;

    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

    if (
      partnershipData.id === '538e11b4-061e-489f-ae52-3bddb0cafe1d' ||
      partnershipData.id === 'f12665bc-b969-4877-9c6d-54ef5c23d86f'
    ) {
      questionText = await generatePersonalizedQuestion({
        partnership: partnershipData,
        usersLanguage,
        openai,
      });
    } else if (questionIndex >= 0 && questionIndex < defaultQuestions.length) {
      const englishQuestion = defaultQuestions[questionIndex];

      if (usersLanguage !== 'en') {
        try {
          const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: `Convert the following question prompt into ${languageMap[usersLanguage]}`,
              },
              { role: 'user', content: englishQuestion },
            ],
            model: 'gpt-3.5-turbo',
          });

          const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
          questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
        } catch (error) {
          functions.logger.error(`Error translating with OpenAI request: ${JSON.stringify(error)}`);

          const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
          questionText = defaultQuestions[backupIndex];
        }
      } else {
        questionText = englishQuestion;
      }
    } else {
      questionText = await generatePersonalizedQuestion({
        partnership: partnershipData,
        usersLanguage,
        openai,
      });
    }

    const questionId = uuidv4();
    const question = {
      id: questionId,
      partnershipId: partnershipData.id,
      text: questionText,
      createdAt: admin.firestore.Timestamp.now(),
    };

    try {
      const batch = db.batch();
      batch.set(
        db.collection('partnership').doc(partnershipData.id),
        {
          latestQuestionId: questionId,
        },
        { merge: true },
      );

      batch.set(db.collection('questions').doc(questionId), question, {
        merge: true,
      });

      await batch.commit();
    } catch (error) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);
        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${error}`,
          error,
        );
      }
    }

    return {
      question,
      isNewQuestion: true,
    };
  });

function getTimeZonesForMidnight() {
  const timeZones = moment.tz.names();

  return timeZones.filter((timeZone) => {
    const currentTime = moment().tz(timeZone);
    return currentTime.hour() === 0 && currentTime.minute() <= 5;
  });
}

export const calculateQuestionIndex = (createdAt: Date, timeZone: string) => {
  if (!createdAt) return 0;

  const startOfDayCreatedAt = startOfDayInTimeZone(createdAt, timeZone);
  const startOfDayToday = startOfDayInTimeZone(new Date(), timeZone);

  let index = startOfDayToday.diff(startOfDayCreatedAt, 'days');
  index = Math.max(0, index);

  return index;
};

const areUsersSubscribed = async (partnershipId: string) => {
  const db = admin.firestore();
  const usersSnapshot = await db
    .collection('users')
    .where('partnershipId', '==', partnershipId)
    .get();

  if (usersSnapshot.empty) {
    functions.logger.info(`No users found for this partnership ${partnershipId}`);
    return false;
  }

  let allSubscribed = true;
  usersSnapshot.forEach((userSnapshot) => {
    const user = userSnapshot.data();

    if (!user?.isSubscribed) {
      allSubscribed = false;
      functions.logger.info(`User ${user.id} is not subscribed.`);
    }
  });

  return allSubscribed;
};

async function processPartnership(doc: any) {
  if (!doc.exists) {
    functions.logger.info('No partnership document!');
    return;
  }
  const db = admin.firestore();

  const partnership = doc.data();
  const usersLanguage = partnership?.language || 'en';

  functions.logger.info(`Processing partnership ${partnership.id}`);

  const areSubscribed = await areUsersSubscribed(partnership.id);
  if (!areSubscribed) {
    functions.logger.info(`Skipping over partnership since they are not subscribed`);
    return;
  }

  const shouldGenerateQuestion = await shouldGenerateNewQuestion(partnership.id);
  if (!shouldGenerateQuestion) {
    functions.logger.info(
      `Skipping over partnership since they have not answered the latest question`,
    );
    return;
  }

  const createdAt = formatCreatedAt(partnership.createdAt, partnership.timeZone);
  const questionIndex = calculateQuestionIndex(createdAt, partnership.timeZone);

  let questionText;

  const apiKey = openApiKey.value();
  const openai = new OpenAI({ apiKey });

  if (
    partnership.id === '538e11b4-061e-489f-ae52-3bddb0cafe1d' ||
    partnership.id === 'f12665bc-b969-4877-9c6d-54ef5c23d86f'
  ) {
    questionText = await generatePersonalizedQuestion({
      partnership,
      usersLanguage,
      openai,
    });
  } else if (questionIndex >= 0 && questionIndex < defaultQuestions.length) {
    const englishQuestion = defaultQuestions[questionIndex];

    if (usersLanguage !== 'en') {
      try {
        const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Convert the following question prompt into ${languageMap[usersLanguage]}`,
            },
            { role: 'user', content: englishQuestion },
          ],
          model: 'gpt-3.5-turbo',
        });

        const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
        questionText = openAIQuestion?.replace(/^["']|["']$/g, '');

        functions.logger.info(`OpenAI question: ${questionText}`);
      } catch (error) {
        functions.logger.error(`Error translating with OpenAI request: ${JSON.stringify(error)}`);

        const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
        questionText = defaultQuestions[backupIndex];
      }
    } else {
      questionText = englishQuestion;
    }
  } else {
    questionText = await generatePersonalizedQuestion({
      partnership,
      usersLanguage,
      openai,
    });
  }

  const questionId = uuidv4();
  const createdAtInTimeZone = moment.tz(new Date(), partnership.timeZone).toDate();
  const firestoreTimestamp = admin.firestore.Timestamp.fromDate(createdAtInTimeZone);

  const question = {
    id: questionId,
    partnershipId: partnership.id,
    text: questionText,
    createdAt: firestoreTimestamp,
  };

  functions.logger.info(
    `Saving question (${questionId}) for partnership (${partnership.id}). Question is ${question.text} for time created at ${createdAtInTimeZone}`,
  );

  try {
    const batch = db.batch();
    batch.set(
      db.collection('partnership').doc(partnership.id),
      {
        latestQuestionId: questionId,
      },
      { merge: true },
    );
    batch.set(db.collection('questions').doc(questionId), question, {
      merge: true,
    });

    await batch.commit();
  } catch (error) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error saving generated question: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);
      throw new functions.https.HttpsError(
        'unknown',
        `Error saving generated question: ${error}`,
        error,
      );
    }
  }
}

export const checkMidnightInTimeZones = functions
  .runWith({ secrets: [openApiKey] })
  .pubsub.schedule('0 * * * *')
  .onRun(async () => {
    try {
      const db = admin.firestore();
      const partnerships = await db.collection('partnership').get();

      const timeZonesAtMidnight = getTimeZonesForMidnight();
      if (timeZonesAtMidnight.length === 0) {
        functions.logger.info('No time zones at midnight');
        return;
      }

      const partnershipsAtMidnight = partnerships.docs.filter((doc) =>
        timeZonesAtMidnight.includes(doc.data().timeZone),
      );

      await Promise.all(partnershipsAtMidnight.map((doc) => processPartnership(doc)));
    } catch (error) {
      functions.logger.error('Error in checkMidnightInTimeZones function:', error);
    }
  });
