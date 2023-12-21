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

exports.generateQuestion = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Endpoint requires authentication!',
      );
    }

    const { partnershipData, partnerData, userData } = data;
    functions.logger.info(
      `Partnership Data: ${JSON.stringify(partnershipData)}`,
    );

    const db = admin.firestore();
    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

    try {
      const relationshipDuration = calculateDuration(partnershipData.startDate);
      const userName = userData.name;
      const partnerName = partnerData.name;
      const relationshipType =
        relationshipTypeMap[partnershipData.type as RelationshipType];

      const adjectives = [
        'insightful',
        'thought-provoking',
        'fun',
        'creative',
        'unique',
        'engaging',
      ];

      const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];

      const prompt = `Craft a ${randomAdjective} question (85 characters max) for ${userName} and ${partnerName}, who are ${relationshipType} for ${relationshipDuration}.`;
      const systemPrompt = `As a couples expert, suggest a question that encourages ${userName} and ${partnerName} to explore new dimensions of their relationship, foster understanding, or share a meaningful moment.`;

      functions.logger.info(`Prompt: ${prompt}`);

      const chatCompletion: OpenAI.Chat.ChatCompletion =
        await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          model: 'gpt-4',
        });

      const questionText: string | null =
        chatCompletion.choices[0].message.content;
      const cleanedQuestionText = questionText?.replace(/^["']|["']$/g, '');

      const questionId = uuidv4();
      const question = {
        id: questionId,
        partnershipId: partnershipData.id,
        text: cleanedQuestionText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

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

      return question;
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

        throw new functions.https.HttpsError(
          'unknown',
          `Error sending SMS: ${error}`,
          error,
        );
      }
    }
  });

function calculateDuration(startDate: string) {
  const now = new Date();
  const start = new Date(startDate);

  if (isNaN(start.getTime())) {
    return 'some amount of time';
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
    years--;
    months = 12 + months;
  }

  if (now.getDate() < start.getDate()) {
    months--;
  }

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months >= 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    return 'Less than a month';
  }
}

exports.sendPartnerInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Endpoint requires authentication!',
    );
  }

  const { inviteName, invitePhoneNumber, senderName } = data;
  try {
    await admin
      .firestore()
      .collection('sms')
      .add({
        to: invitePhoneNumber,
        body: `Hey, ${inviteName}! ${senderName} has invited you to join 'You First.' Starting today, both of you can enjoy a free 30-day trial. Have fun! Here's the download link: [link] 😊`,
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

      throw new functions.https.HttpsError(
        'unknown',
        `Error sending SMS: ${error}`,
        error,
      );
    }
  }
});

async function updatePartnerEntitlement(userId: string, hasAccess: boolean) {
  try {
    const partnerId = await fetchPartnerId(userId);
    if (!partnerId) {
      functions.logger.error('No partner ID found');
      return;
    }

    const partner = await admin.auth().getUser(partnerId);
    const currentClaims = partner.customClaims || {};

    await admin.auth().setCustomUserClaims(partnerId, {
      ...currentClaims,
      revenueCatEntitlements: hasAccess ? ['premium'] : [],
    });

    functions.logger.info(
      `Updated partner to subscription access: ${hasAccess}`,
    );
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
    } else {
      functions.logger.error(`No partner found for user ID: ${userId}`);
      return null;
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
          await updatePartnerEntitlement(userId, true);
          break;
        case 'CANCELLATION':
          if (!isTrialPeriod) {
            await updatePartnerEntitlement(userId, false);
          }
          break;
        case 'EXPIRATION':
          await updatePartnerEntitlement(userId, false);
          break;
        case 'SUBSCRIPTION_PAUSED':
          // Handle paused subscription, but do not revoke access
          break;
        case 'BILLING_ISSUE':
          // Handle billing issue, but do not revoke access
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

// Notifications function
// https://rnfirebase.io/messaging/notifications

// await admin.messaging().sendMulticast({
//   tokens: [
//     /* ... */
//   ], // ['token_1', 'token_2', ...]
//   notification: {
//     title: 'Basic Notification',
//     body: 'This is a basic notification sent from the server!',
//     imageUrl: 'https://my-cdn.com/app-logo.png',
//   },
// });
