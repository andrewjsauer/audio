import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';

import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import fetch from 'cross-fetch';
import crypto from 'crypto-js';
import moment from 'moment-timezone';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

const openApiKey = defineSecret('OPEN_AI_API_KEY');
const recordingEncryptionKey = defineSecret('RECORDING_ENCRYPTION_KEY');

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

const relationshipTypeMap: { [key in RelationshipType]: string } = {
  stillGettingToKnowEachOther: 'Still Getting to Know Each Other',
  dating: 'Dating',
  inARelationship: 'In a Relationship',
  engaged: 'Engaged',
  domesticPartnership: 'Domestic Partnership',
  cohabiting: 'Cohabiting',
  longDistanceRelationship: 'Long Distance Relationship',
  consensualNonMonogamousRelationship: 'Consensual Non-monogamous Relationship',
  inAnOpenRelationship: 'Open Relationship',
  married: 'Married',
};

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
  'What is a funny or quirky habit of your partner that makes you happy?',
  'What is the ultimate dream vacation you want to take with your partner?',
  "What's your favorite date you've been on together?",
  "What's something very unique that you love about your partner?",
  'How do you prefer to manage stress in your relationship?',
  'What is your favorite outfit that your partner wears?',
  'If you could take three university classes what would you take?',
  'What is your favorite thing about your partner?',
  'What new habit would you really love to adopt together?',
  'Who are three of your heroes or inspirations and why?',
  'What do you want to do with your partner the very next time you see each other?',
  'If you could go together to see 1-3 musicians live, who would they be?',
  'What is your favorite memory of your partner?',
  'What does your absolute perfect day look like?',
  'What are some things that keep your romance alive and healthy?',
  "What are two dates you'd like to go on?",
  'What is something you very deeply wish you had more time for daily or weekly?',
  "What is something new you'd like to try together?",
  "What's something intimate you want to try with your partner?",
  "What is something you want to tell your partner that you're really sorry for?",
  'What is your most cherished tradition, celebration, or ritual as a couple?',
  'What is something you want your partner to teach you?',
  'What three things do you appreciate most about your partner?',
  'What is something you want to do with your partner?',
  'What do you most love doing for your partner?',
  'What does your dream house look like?',
  'Which friends do you wish you would hang out with more often together?',
  'What movie would you like to watch together with some popcorn and hot cocoa?',
  'How do you show love and affection to each other?',
  'What outdoor activity would you love to do together next week?',
  'What is something you want to learn about your partner?',
  'What have been three of your proudest moments?',
  'What do you really want to do this weekend?',
  'How has your partner positively influenced your life?',
  'Where would you love to live with together for 3 months next year?',
  'What do you think your partner wants more of?',
  "How have you supported each other's goals?",
  'What challenge have you overcome and how has it changed your relationship?',
  'What have you learned about love and relationships from being with your partner?',
  'Which dish or treat has your partner made that you miss badly',
  'What activity, hobby, or sport have you never done and would love to try together?',
  "What is the best piece of advice you've received about relationships?",
  'What friend do you wish you would personally reconnect with?',
];

exports.generateQuestion = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const { questionIndex, partnershipData, partnerData, userData, usersLanguage } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const db = admin.firestore();
    let questionText;

    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

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

    if (questionIndex >= 0 && questionIndex < defaultQuestions.length) {
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
      try {
        const relationshipDuration = partnershipData.startDate;
        const userName = userData.name;
        const partnerName = partnerData.name;
        const relationshipType = relationshipTypeMap[partnershipData?.type as RelationshipType];

        const adjectives = [
          'insightful',
          'thought-provoking',
          'fun',
          'creative',
          'unique',
          'engaging',
          'reflective',
          'heartwarming',
          'challenging',
          'humorous',
          'intimate',
          'empathetic',
          'curious',
          'romantic',
          'practical',
          'inspirational',
        ];

        const timeFrames = ['past', 'present', 'future'];

        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomTimeFrame = timeFrames[Math.floor(Math.random() * timeFrames.length)];
        const promptLanguage =
          usersLanguage === 'en' ? '' : ` in ${languageMap[usersLanguage] || 'English'}`;

        const prompt = `Craft a ${randomAdjective} question${promptLanguage} (90 characters max) about their ${randomTimeFrame} for ${userName} and ${partnerName} who are ${relationshipType} and have been together for ${relationshipDuration}.`;
        const systemPrompt = `As a couples expert, suggest a question that encourages ${userName} and ${partnerName} to explore new dimensions of their relationship, foster understanding, or share a meaningful moment.`;

        functions.logger.info(`Prompt: ${prompt}`);

        const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          model: 'gpt-4',
        });

        const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
        questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
      } catch (error: unknown) {
        functions.logger.error(`Error with OpenAI request: ${JSON.stringify(error)}`);

        const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
        questionText = defaultQuestions[backupIndex];
      }
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

async function fetchPartnerId(userId: string) {
  try {
    const partnerRef = admin
      .firestore()
      .collection('partnershipUser')
      .where('userId', '==', userId);

    const snapshot = await partnerRef.get();
    if (!snapshot.empty) {
      const partnerData = snapshot.docs[0].data();
      return partnerData.otherUserId;
    }
    functions.logger.error(`No partner found for user ID: ${userId}`);
    return null;
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating partner subscription: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating partner subscription: ${error}`,
        error,
      );
    }
  }
}

async function updateSubscriptions(userId: string, hasAccess: boolean) {
  const db = admin.firestore();
  const batch = db.batch();

  try {
    const partnerId = await fetchPartnerId(userId);
    if (!partnerId) {
      functions.logger.error('No partner ID found');
      return;
    }

    const userDocRef = db.collection('users').doc(userId);
    const partnerDocRef = db.collection('users').doc(partnerId);

    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      functions.logger.error(`User document with ID ${userId} does not exist`);
      return;
    }

    const partnerDoc = await partnerDocRef.get();
    if (!partnerDoc.exists) {
      functions.logger.error(`Partner document with ID ${partnerId} does not exist`);
      return;
    }

    batch.set(userDocRef, { isSubscribed: hasAccess }, { merge: true });
    batch.set(partnerDocRef, { isSubscribed: hasAccess }, { merge: true });

    await batch.commit();

    functions.logger.info(`Updated user and partner to subscription access: ${hasAccess}`);
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating partner subscription: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating partner subscription: ${error}`,
        error,
      );
    }
  }
}

function checkTrialPeriod(eventData: any) {
  if (eventData.period_type === 'TRIAL') {
    const now = new Date().getTime();
    const expirationAtMs = eventData.expiration_at_ms;

    return now < expirationAtMs;
  }

  return false;
}

exports.handleSubscriptionEvents = functions.firestore
  .document('customerEvents/{eventId}')
  .onCreate(async (snapshot) => {
    try {
      const eventData = snapshot.data();
      const userId = eventData.app_user_id;
      const eventType = eventData.type;

      functions.logger.info('Event Type', eventType);

      const isTrialPeriod = checkTrialPeriod(eventData);

      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'NON_RENEWING_PURCHASE':
        case 'SUBSCRIPTION_EXTENDED':
          await updateSubscriptions(userId, true);
          break;
        case 'CANCELLATION':
          if (!isTrialPeriod) {
            await updateSubscriptions(userId, false);
          }
          break;
        case 'EXPIRATION':
          await updateSubscriptions(userId, false);
          break;
        case 'SUBSCRIPTION_PAUSED':
          // Handle paused subscription, but do not revoke access
          break;
        case 'BILLING_ISSUE':
          // Handle billing issue, but do not revoke access
          break;
        default:
          break;
      }
    } catch (error: unknown) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

        throw new functions.https.HttpsError(
          'unknown',
          `Error updating partner subscription: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);

        throw new functions.https.HttpsError(
          'unknown',
          `Error updating partner subscription: ${error}`,
          error,
        );
      }
    }
  });

exports.updatePartnershipPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { userId, partnerId } = data;
  const db = admin.firestore();
  const batch = db.batch();

  try {
    batch.set(
      db.collection('users').doc(userId),
      {
        hasSubscribed: true,
        isSubscribed: true,
      },
      { merge: true },
    );

    batch.set(
      db.collection('users').doc(partnerId),
      {
        hasSubscribed: true,
        isSubscribed: true,
      },
      { merge: true },
    );

    await batch.commit();
    return null;
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating user data: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError('unknown', `Error updating user data: ${error}`, error);
    }
  }
});

exports.updateNewUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { id, userDetails, tempId } = data;
  const db = admin.firestore();
  const batch = db.batch();

  let userPayload = { ...userDetails };

  try {
    const usersCollection = db.collection('users');
    const tempDocRef = usersCollection.doc(tempId);
    const tempDoc = await tempDocRef.get();

    if (tempDoc.exists) {
      const prevData = tempDoc.data();
      const { isSubscribed, hasSubscribed } = prevData as any;

      const newUserRef = usersCollection.doc(id);
      userPayload = {
        ...tempDoc.data(),
        ...userPayload,
        isSubscribed,
        hasSubscribed,
        id,
      };

      batch.set(newUserRef, userPayload, { merge: true });
      batch.delete(tempDocRef);
    } else {
      throw new functions.https.HttpsError(
        'unknown',
        `Error updating user data: Temp user not found`,
      );
    }

    const partnershipUserRef = db.collection('partnershipUser');
    const pUserQuery = partnershipUserRef.where('userId', '==', tempId);
    const pUserSnapshot = await pUserQuery.get();

    if (!pUserSnapshot.empty) {
      const partnershipDocRef = pUserSnapshot.docs[0].ref;
      batch.set(partnershipDocRef, { userId: id }, { merge: true });
    } else {
      throw new functions.https.HttpsError(
        'unknown',
        `Error updating user data: Temp partnership user not found`,
      );
    }

    const pUserPartnerQuery = partnershipUserRef.where('otherUserId', '==', tempId);
    const pUserPartnerSnapshot = await pUserPartnerQuery.get();

    if (!pUserPartnerSnapshot.empty) {
      const partnershipPartnerDocRef = pUserPartnerSnapshot.docs[0].ref;
      batch.set(partnershipPartnerDocRef, { otherUserId: id }, { merge: true });
    } else {
      throw new functions.https.HttpsError(
        'unknown',
        `Error updating user data: Temp partnership partner not found`,
      );
    }

    await batch.commit();
    return userPayload;
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error updating user data: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError('unknown', `Error updating user data: ${error}`, error);
    }
  }
});

exports.deletePartnership = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { userId, partnershipId, partnerId } = data;
  try {
    const db = admin.firestore();
    const batch = db.batch();

    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);

    const partnerRef = db.collection('users').doc(partnerId);
    batch.delete(partnerRef);

    const partnershipRef = db.collection('partnership').doc(partnershipId);
    batch.delete(partnershipRef);

    const partnershipUserRefs = db
      .collection('partnershipUser')
      .where('partnershipId', '==', partnershipId);
    const partnershipUserSnapshot = await partnershipUserRefs.get();
    partnershipUserSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const recordingsRefs = db
      .collection('recordings')
      .where('userId', 'in', [userId, partnerId].filter(Boolean));
    const recordingsSnapshot = await recordingsRefs.get();

    recordingsSnapshot.forEach((doc) => {
      const recordingData = doc.data();
      batch.delete(doc.ref);

      admin.storage().bucket().file(`recordings/${recordingData.id}.enc`).delete();
    });

    const listeningsRef = db
      .collection('listenings')
      .where('userId', 'in', [userId, partnerId].filter(Boolean));
    const listeningsSnapshot = await listeningsRef.get();
    listeningsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const customersRef = db
      .collection('customers')
      .where('userId', 'in', [userId, partnerId].filter(Boolean));
    const customersSnapshot = await customersRef.get();
    customersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const customerEventsRef = db
      .collection('customerEvents')
      .where('app_user_id', 'in', [userId, partnerId].filter(Boolean));
    const customerEventsSnapshot = await customerEventsRef.get();
    customerEventsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    functions.logger.info(`Deleting partnership ${partnershipId}`);

    await batch.commit();

    return null;
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error deleting relationship: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError(
        'unknown',
        `
        Error deleting relationship: ${error}`,
        error,
      );
    }
  }
});

exports.sendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { title, body, tokens } = data;
  try {
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
      },
    });

    functions.logger.info('Notification sent successfully!');
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error sending notification: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error sending notification: ${error}`,
        error,
      );
    }
  }
});

exports.sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { phoneNumber, body } = data;

  try {
    await admin.firestore().collection('sms').add({
      to: phoneNumber,
      body,
    });

    functions.logger.info('SMS sent successfully!');
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error sending SMS: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError('unknown', `Error sending SMS: ${error}`, error);
    }
  }
});

async function getPartnerIdByPhoneNumber(phoneNumber: string) {
  const partnerQuery = await admin
    .firestore()
    .collection('users')
    .where('phoneNumber', '==', phoneNumber)
    .get();

  if (!partnerQuery.empty) {
    functions.logger.info('Partner found!');
    const partnerData = partnerQuery.docs[0] as any;

    return { partnerId: partnerData.id, partnerData, isNewUser: false };
  }

  const partnerId = uuidv4();
  return { partnerId, partnerData: null, isNewUser: true };
}

exports.generatePartnership = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { userDetails, partnerDetails, partnershipDetails } = data;
  const userId = context.auth.uid;

  const { type, startDate, timeZone = 'America/Los_Angeles' } = partnershipDetails;

  try {
    const batch = admin.firestore().batch();
    const partnershipId = uuidv4();
    const { partnerId, partnerData, isNewUser } = await getPartnerIdByPhoneNumber(
      partnerDetails.phoneNumber,
    );

    functions.logger.info(`Partner ID: ${partnerId}`);

    if (!isNewUser && partnerData) {
      const partnershipUserRef = admin
        .firestore()
        .collection('partnershipUser')
        .where('userId', '==', partnerData.id);
      const partnershipUserData = await partnershipUserRef.get();

      if (!partnershipUserData.empty) {
        const partnershipUser = partnershipUserData.docs[0].data();

        if (partnershipUser.otherUserId !== userId) {
          functions.logger.error('Partner already has a partner');
          throw new functions.https.HttpsError(
            'already-exists',
            'Partner already has a partner',
            partnershipUser,
          );
        }
      }
    }

    const partnershipRef = admin.firestore().collection('partnership').doc(partnershipId);
    const partnershipData = {
      createdAt: admin.firestore.Timestamp.now(),
      id: partnershipId,
      latestQuestionId: null,
      startDate,
      timeZone,
      type,
    };
    batch.set(partnershipRef, partnershipData, { merge: true });

    const partnershipUser1Id = uuidv4();
    const partnershipUserRef1 = admin
      .firestore()
      .collection('partnershipUser')
      .doc(partnershipUser1Id);

    batch.set(
      partnershipUserRef1,
      {
        id: partnershipUser1Id,
        partnershipId,
        userId,
        otherUserId: partnerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const partnershipUser2Id = uuidv4();
    const partnershipUserRef2 = admin
      .firestore()
      .collection('partnershipUser')
      .doc(partnershipUser2Id);
    batch.set(
      partnershipUserRef2,
      {
        id: partnershipUser2Id,
        partnershipId,
        userId: partnerId,
        otherUserId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const userRef = admin.firestore().collection('users').doc(userId);
    const userPayload = {
      ...userDetails,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      id: userId,
      isPartner: false,
      isRegistered: true,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      partnershipId,
      isSubscribed: false,
      hasSubscribed: false,
    };
    batch.set(userRef, userPayload, { merge: true });

    const partnerRef = admin.firestore().collection('users').doc(partnerId);
    const partnerPayload = {
      ...partnerDetails,
      birthDate: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      id: partnerId,
      isPartner: true,
      isRegistered: false,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      partnershipId,
      isSubscribed: false,
      hasSubscribed: false,
    };
    batch.set(partnerRef, partnerPayload, { merge: true });

    const smsRef = admin.firestore().collection('sms').doc();
    batch.set(smsRef, {
      to: partnerDetails.phoneNumber,
      body: `Hey, ${partnerDetails.name}! ${userDetails.name} has invited you to join Daily Q’s. Starting today, both of you can enjoy a free 30-day trial. Have fun! Here's the download link: https://apps.apple.com/us/app/daily-qs-couples-edition/id6474273822 😊`,
    });

    await batch.commit();

    return {
      userPayload: {
        ...userPayload,
      },
      partnerPayload: {
        ...partnerPayload,
      },
      partnershipPayload: {
        ...partnershipData,
      },
    };
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error generating partnership: ${e.response.data}`,
        e.response.data,
      );
    } else {
      functions.logger.error(`Error message ${error}`);

      throw new functions.https.HttpsError(
        'unknown',
        `Error generating partnership: ${error}`,
        error,
      );
    }
  }
});

exports.getRecording = functions
  .runWith({ secrets: [recordingEncryptionKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const encryptionKey = recordingEncryptionKey.value();
    const { audioUrl } = data;

    try {
      const response = await fetch(audioUrl);
      const encryptedDataBase64 = await response.text();

      functions.logger.debug(`Encrypted data size: ${encryptedDataBase64.length} bytes`);

      const decrypted = crypto.AES.decrypt(encryptedDataBase64, encryptionKey);
      const decryptedData = crypto.enc.Base64.stringify(decrypted);

      functions.logger.debug(`Decrypted data size: ${decryptedData.length} bytes`);

      return { audioData: decryptedData };
    } catch (error) {
      throw new functions.https.HttpsError('internal', 'Error retrieving and decrypting recording');
    }
  });

exports.saveRecording = functions
  .runWith({ secrets: [recordingEncryptionKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const encryptionKey = recordingEncryptionKey.value();

    const { base64Data, questionId, userData, duration, partnerData } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const { id: userId, partnershipId } = userData;
    const recordingId = `${userId}_${questionId}`;

    try {
      functions.logger.debug(`Original Base64 data size: ${base64Data.length} characters`);
      const encrypted = crypto.AES.encrypt(base64Data, encryptionKey).toString();
      functions.logger.debug(`Encrypted Base64 data size: ${encrypted.length} characters`);

      const storageRef = admin.storage().bucket().file(`recordings/${recordingId}.enc`);

      await storageRef.save(encrypted, {
        contentType: 'application/octet-stream',
      });

      const [audioUrl] = await storageRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491',
      });

      const recordingData = {
        audioUrl,
        createdAt: admin.firestore.Timestamp.now(),
        didLikeQuestion: null,
        duration,
        feedbackText: null,
        id: recordingId,
        partnershipId,
        questionId,
        reaction: [],
        userId,
      };

      await admin
        .firestore()
        .collection('recordings')
        .doc(recordingId)
        .set(recordingData, { merge: true });

      if (partnerData.deviceIds && partnerData.deviceIds.length > 0) {
        await admin.messaging().sendMulticast({
          tokens: partnerData.deviceIds,
          notification: {
            title: `${userData.name} answered today's question!`,
            body: 'Tap to listen to their answer.',
          },
        });
      } else {
        await admin
          .firestore()
          .collection('sms')
          .add({
            phoneNumber: partnerData.phoneNumber,
            body: `${userData.name} answered today's question on Daily Q’s! Download the app to listen to their answer. Link: https://apps.apple.com/us/app/daily-qs-couples-edition/id6474273822`,
          });
      }

      return { ...recordingData };
    } catch (error: unknown) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);
        throw new functions.https.HttpsError(
          'unknown',
          `Error saving recording: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);
        throw new functions.https.HttpsError('unknown', `Error saving recording: ${error}`, error);
      }
    }
  });

function getTimeZonesForReminder() {
  const timeZones = moment.tz.names();

  return timeZones.filter((timeZone) => {
    const currentTime = moment().tz(timeZone);

    const isAfternoon = currentTime.hour() === 12 && currentTime.minute() <= 5;
    const isEvening = currentTime.hour() === 20 && currentTime.minute() <= 5;

    return isAfternoon || isEvening;
  });
}

async function sendAfternoonReminderNotificationIfNeeded(
  userDoc: any,
  timeZone: string,
  cutOffTime: any,
) {
  const db = admin.firestore();

  const userId = userDoc.data()?.userId;
  if (!userId) {
    functions.logger.info('User ID not found in document');
    return;
  }

  const userSnapshot = await db.collection('users').doc(userId).get();
  if (!userSnapshot.exists) {
    functions.logger.info(`User not found: ${userId}`);
    return;
  }

  const userData = userSnapshot.data() as any;
  if (
    !userData.deviceIds ||
    userData.deviceIds.length === 0 ||
    !userData.isSubscribed ||
    !userData.lastActiveAt
  ) {
    return;
  }

  try {
    const lastActiveAt = moment(userData.lastActiveAt).tz(timeZone).valueOf();

    if (lastActiveAt < cutOffTime.valueOf()) {
      const response = await admin.messaging().sendMulticast({
        tokens: userData.deviceIds,
        notification: {
          title: 'New question available!',
          body: 'Tap to see what question you are getting today',
        },
      });

      functions.logger.info(
        `Afternoon reminder sent successfully for user: ${userId}, response: ${JSON.stringify(
          response,
        )}`,
      );
    } else {
      functions.logger.info(`No notification needed for user: ${userId}`);
    }
  } catch (error) {
    functions.logger.error(`Error sending notification for user: ${userId}, error: ${error}`);
  }
}

async function sendReminderNotification(userId: string) {
  const userSnapshot = await admin.firestore().collection('users').doc(userId).get();
  if (!userSnapshot.exists) return;

  const userData = userSnapshot.data();
  if (!userData.deviceIds || userData.deviceIds.length === 0) return;

  await admin.messaging().sendMulticast({
    tokens: userData.deviceIds,
    notification: {
      title: "Don't forget to check today's question!",
      body: 'Tap to see what question you are getting today',
    },
  });

  functions.logger.info(`Evening reminder notification sent for user: ${userId}`);
}

async function sendPartnerRecordingReminder(userData: any, partnerId: string) {
  let partnerName = 'Your partner';

  try {
    const partnerSnapshot = await admin.firestore().collection('users').doc(partnerId).get();
    if (!partnerSnapshot.exists) return;

    const partnerData = partnerSnapshot.data();
    partnerName = partnerData?.name || 'Your partner';
  } catch (error) {
    functions.logger.error(`Error getting partner: ${partnerId}`, error);
    return;
  }

  if (!userData.deviceIds || userData.deviceIds.length === 0) return;

  // await admin.messaging().sendMulticast({
  //   tokens: userData.deviceIds,
  //   notification: {
  //     title: `${partnerName} has answered!,`,
  //     body: 'Tap to hear their response to today’s question.',
  //   },
  // });

  functions.logger.info(
    `Evening partner recording reminder notification sent for user: ${userData.id} to ${partnerName}`,
  );
}

async function checkUserActivity(userDoc: any, cutOffTime: any, timeZone: string) {
  const userId = userDoc.data()?.userId;
  if (!userId) {
    functions.logger.info('User ID not found in document');
    return { userId, userData: null, active: false };
  }

  let userSnapshot;

  try {
    userSnapshot = await admin.firestore().collection('users').doc(userId).get();
    if (!userSnapshot.exists) return { userId, active: false };
  } catch (error) {
    functions.logger.error(`Error getting user: ${userId}`, error);
    return { userId, userData: null, active: false };
  }

  const userData = userSnapshot.data();
  const lastActiveAt = moment(userData.lastActiveAt._seconds * 1000)
    .tz(timeZone)
    .valueOf();

  return { userId, userData, active: lastActiveAt >= cutOffTime.valueOf() };
}

async function processActiveUserLogic(activeUser: any, latestQuestionId: string, timeZone: string) {
  const db = admin.firestore();
  let questionData = null;

  try {
    const questionSnapshot = await db.collection('questions').doc(latestQuestionId).get();

    if (!questionSnapshot.exists) {
      functions.logger.info(`Question not found: ${latestQuestionId}`);
      return;
    }

    questionData = questionSnapshot.data();
  } catch (error) {
    functions.logger.error(`Error getting question: ${latestQuestionId}`, error);
    return;
  }

  const questionCreationDate = moment(questionData.createdAt._seconds * 1000)
    .tz(timeZone)
    .startOf('day')
    .valueOf();
  const currentDayStart = moment().tz(timeZone).startOf('day').valueOf();

  if (questionCreationDate !== currentDayStart) {
    functions.logger.info('Question is not today');
    return;
  }

  const recordingSnapshot = await db
    .collection('recordings')
    .where('questionId', '==', latestQuestionId)
    .get();

  if (recordingSnapshot.empty) {
    functions.logger.info('No recordings found');
    return;
  }

  await Promise.all(
    recordingSnapshot.docs.map(async (doc) => {
      const recordingData = doc.data();

      if (recordingData.userId !== activeUser.id) {
        await sendPartnerRecordingReminder(activeUser, recordingData.userId);
      }
    }),
  );
}

async function handleEveningLogic(
  partnershipUsers: any,
  timeZone: string,
  latestQuestionId: string,
) {
  const eveningCutOffTime = moment().tz(timeZone).hour(20);

  const userActivityPromises = partnershipUsers.docs.map((userDoc: any) =>
    checkUserActivity(userDoc, eveningCutOffTime, timeZone),
  );

  const userActivities = await Promise.all(userActivityPromises);
  const inactiveUsers = userActivities.filter((activity) => !activity.active);

  if (inactiveUsers.length === 2) {
    functions.logger.info('Both users are inactive');
    await Promise.all(inactiveUsers.map(({ userData }) => sendReminderNotification(userData.id)));
  } else if (inactiveUsers.length === 1) {
    functions.logger.info('One user is inactive');
    await processActiveUserLogic(inactiveUsers[0], latestQuestionId, timeZone);
  } else if (inactiveUsers.length === 0) {
    functions.logger.info('Both users are active');
  }
}

async function handleAfternoonLogic(partnershipUsers: any, timeZone: string) {
  const afternoonCutOffTime = moment().tz(timeZone).hour(12);

  const notificationPromises = partnershipUsers.docs.map((userDoc: any) =>
    sendAfternoonReminderNotificationIfNeeded(userDoc, timeZone, afternoonCutOffTime),
  );

  await Promise.all(notificationPromises);
}

async function processPartnership(partnershipDoc: any) {
  const partnershipData = partnershipDoc.data();
  if (!partnershipData) {
    functions.logger.error('Partnership data not found in document');
    return;
  }

  const { id: partnershipId, timeZone, latestQuestionId } = partnershipData;
  const currentTime = moment().tz(timeZone);

  try {
    const db = admin.firestore();

    const partnershipUsers = await db
      .collection('partnershipUser')
      .where('partnershipId', '==', partnershipId)
      .get();

    if (partnershipUsers.empty) {
      functions.logger.info(`No users found for partnership: ${partnershipId}`);
      return;
    }

    const isAfternoon = currentTime.hour() === 12 && currentTime.minute() <= 5;
    const isEvening = currentTime.hour() === 20 && currentTime.minute() <= 5;

    if (isAfternoon) {
      functions.logger.info('Afternoon', partnershipId);
      await handleAfternoonLogic(partnershipUsers, timeZone);
    } else if (isEvening) {
      functions.logger.info('Evening', partnershipId);
      await handleEveningLogic(partnershipUsers, timeZone, latestQuestionId);
    }
  } catch (error) {
    functions.logger.error(`Error processing partnership: ${partnershipId}`, error);
  }
}

exports.checkTimeZones = functions.pubsub.schedule('every 60 minutes').onRun(async () => {
  try {
    const db = admin.firestore();
    const partnerships = await db.collection('partnership').get();

    const timeZonesToSend = getTimeZonesForReminder();
    if (timeZonesToSend.length === 0) {
      functions.logger.info('No time zones to send');
      return;
    }

    const partnershipsToSend = partnerships.docs.filter((doc) =>
      timeZonesToSend.includes(doc.data().timeZone),
    );

    await Promise.all(partnershipsToSend.map((doc) => processPartnership(doc)));
  } catch (error) {
    functions.logger.error('Error in checkTimeZones function:', error);
  }
});
