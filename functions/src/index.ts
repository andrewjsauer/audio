import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

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

async function updatePartnerEntitlement(partnerId: string, hasAccess: boolean) {
  try {
    const partner = await admin.auth().getUser(partnerId);
    const currentClaims = partner.customClaims || {};

    await admin.auth().setCustomUserClaims(partnerId, {
      ...currentClaims,
      premium: hasAccess,
    });

    functions.logger.info(
      `Updated partner (${partnerId}) premium access to: ${hasAccess}`,
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
  .onCreate(async (snapshot, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Endpoint requires authentication!',
      );
    }

    try {
      const eventData = snapshot.data();
      const userId = eventData.app_user_id;
      const eventType = eventData.type;

      functions.logger.info('Event Type', eventType);

      const partnerId = await fetchPartnerId(userId);
      if (!partnerId) {
        functions.logger.error('No partner ID found');
        return;
      }

      const isTrialPeriod = checkTrialPeriod(eventData);

      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'NON_RENEWING_PURCHASE':
        case 'SUBSCRIPTION_EXTENDED':
          await updatePartnerEntitlement(partnerId, true);
          break;
        case 'CANCELLATION':
          if (!isTrialPeriod) {
            await updatePartnerEntitlement(partnerId, false);
          }
          break;
        case 'EXPIRATION':
          await updatePartnerEntitlement(partnerId, false);
          break;
        case 'SUBSCRIPTION_PAUSED':
          // Handle paused subscription, but do not revoke access
          break;
        case 'BILLING_ISSUE':
          // Handle billing issue, but do not revoke access
          break;
        case 'TEST':
          // Handle test event, but do not revoke access
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
