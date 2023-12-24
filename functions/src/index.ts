import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';

import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

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

function calculateDuration(startDate: any) {
  const now = new Date();
  let start;

  if (typeof startDate?.toDate === 'function') {
    start = startDate.toDate();
  } else {
    start = new Date(startDate.seconds * 1000);
  }

  if (Number.isNaN(start.getTime())) {
    functions.logger.error(`Invalid date: ${startDate}`);
    return 'some amount of time';
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  return 'Same day';
}

exports.generateQuestion = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const { partnershipData, partnerData, userData } = data;
    functions.logger.info(`Partnership Data: ${JSON.stringify(partnershipData)}`);

    const db = admin.firestore();
    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

    let questionText;

    try {
      const relationshipDuration = calculateDuration(partnershipData.startDate);
      const userName = userData.name;
      const partnerName = partnerData.name;
      const relationshipType = relationshipTypeMap[partnershipData.type as RelationshipType];

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

      const prompt = `Craft a ${randomAdjective} question (90 characters max) about their ${randomTimeFrame} for ${userName} and ${partnerName} who are ${relationshipType} and have been together for ${relationshipDuration}.`;
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

      const defaultQuestions = [
        'What is your favorite memory of your partner?',
        'What is your favorite thing about your partner?',
        'What is something you admire about your partner?',
        'What is something you want to learn about your partner?',
        'What is something you want to do with your partner?',
        'How has your partner positively influenced your life?',
        'What shared goal would you like to achieve with your partner?',
        'What is a fun tradition you would like to start with your partner?',
        'What was your first impression of your partner, and how has it changed?',
        'What is a challenge you’ve overcome together with your partner?',
        'What do you appreciate most about your relationship?',
        'What is a dream vacation you want to take with your partner?',
        'How do you both handle disagreements or conflicts?',
        'What is a small thing your partner does that makes you happy?',
        'What have you learned about love and relationships from being with your partner?',
        'What is a funny or quirky habit of your partner?',
        'How do you show love and affection to each other?',
        'What is the best piece of advice you’ve received as a couple?',
        'What is something new you want to try together?',
        'How do you both support each other’s individual goals?',
        'What is a significant lesson your relationship has taught you?',
        'What are some ways you keep the romance alive?',
        'How do you both manage stress and maintain balance in your relationship?',
        'What is your most cherished tradition or celebration as a couple?',
        'How has your relationship grown or evolved over time?',
      ];

      questionText = defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
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

exports.updateNewUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { id, userDetails, tempId } = data;
  const db = admin.firestore();
  const batch = db.batch();

  let userPayload = {
    ...userDetails,
    birthDate: admin.firestore.Timestamp.fromDate(new Date(userDetails.birthDate)),
  };

  try {
    const usersCollection = db.collection('users');
    const tempDocRef = usersCollection.doc(tempId);
    const tempDoc = await tempDocRef.get();

    if (tempDoc.exists) {
      const prevData = tempDoc.data();
      const { isSubscribed } = prevData as any;

      const newUserRef = usersCollection.doc(id);
      userPayload = {
        ...tempDoc.data(),
        ...userPayload,
        isSubscribed,
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

      admin.storage().bucket().file(`recordings/${recordingData.id}.mp4`).delete();
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
  const userQuery = await admin
    .firestore()
    .collection('users')
    .where('phoneNumber', '==', phoneNumber)
    .get();

  if (!userQuery.empty) {
    return userQuery.docs[0].id;
  }

  return uuidv4();
}

const convertTimestampToISO = (timestamp: string | Date | any) => {
  return timestamp ? timestamp.toDate().toISOString() : new Date().toISOString();
};

exports.generatePartnership = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { userDetails, partnerDetails, partnershipDetails } = data;
  const userId = context.auth.uid;

  const { type, startDate } = partnershipDetails;

  try {
    const batch = admin.firestore().batch();
    const partnershipId = uuidv4();
    const partnerId = await getPartnerIdByPhoneNumber(partnerDetails.phoneNumber);

    const partnershipRef = admin.firestore().collection('partnership').doc(partnershipId);
    const partnershipData = {
      id: partnershipId,
      startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
      type,
      createdAt: admin.firestore.Timestamp.now(),
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
        createdAt: admin.firestore.Timestamp.now(),
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
        createdAt: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    );

    const userRef = admin.firestore().collection('users').doc(userId);
    const userPayload = {
      ...userDetails,
      birthDate: admin.firestore.Timestamp.fromDate(new Date(userDetails.birthDate)),
      createdAt: admin.firestore.Timestamp.now(),
      id: userId,
      isPartner: false,
      isRegistered: true,
      lastActiveAt: admin.firestore.Timestamp.now(),
      partnershipId,
      isSubscribed: false,
    };
    batch.set(userRef, userPayload, { merge: true });

    const partnerRef = admin.firestore().collection('users').doc(partnerId);
    const partnerPayload = {
      ...partnerDetails,
      birthDate: null,
      createdAt: admin.firestore.Timestamp.now(),
      id: partnerId,
      isPartner: true,
      isRegistered: false,
      lastActiveAt: admin.firestore.Timestamp.now(),
      partnershipId,
      isSubscribed: false,
    };
    batch.set(partnerRef, partnerPayload, { merge: true });

    const smsRef = admin.firestore().collection('sms').doc();
    batch.set(smsRef, {
      to: partnerDetails.phoneNumber,
      body: `Hey, ${partnerDetails.name}! ${userDetails.name} has invited you to join 'Daily Qs.' Starting today, both of you can enjoy a free 30-day trial. Have fun! Here's the download link: [link] 😊`,
    });

    await batch.commit();

    return {
      userPayload: {
        ...userPayload,
        birthDate: convertTimestampToISO(userPayload.birthDate),
        createdAt: convertTimestampToISO(userPayload.createdAt),
      },
      partnerPayload: {
        ...partnerPayload,
        createdAt: convertTimestampToISO(partnerPayload.createdAt),
      },
      partnershipPayload: {
        ...partnershipData,
        createdAt: convertTimestampToISO(partnershipData.createdAt),
        startDate: convertTimestampToISO(partnershipData.startDate),
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
