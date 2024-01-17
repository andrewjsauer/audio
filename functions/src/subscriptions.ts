import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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

function isSubscriptionActive(eventData: any) {
  const now = new Date().getTime();
  const expirationAtMs = eventData.expiration_at_ms;

  return now < expirationAtMs;
}

function isTrailPeriod(eventData: any) {
  return eventData.period_type === 'TRIAL';
}

export const handleSubscriptionEvents = functions.firestore
  .document('customerEvents/{eventId}')
  .onCreate(async (snapshot) => {
    try {
      const eventData = snapshot.data();
      const userId = eventData.app_user_id;
      const eventType = eventData.type;

      functions.logger.info('Event Type', eventType);

      const isTrial = isTrailPeriod(eventData);
      const isActive = isSubscriptionActive(eventData);

      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
        case 'NON_RENEWING_PURCHASE':
        case 'SUBSCRIPTION_EXTENDED':
          await updateSubscriptions(userId, true);
          break;
        case 'CANCELLATION':
          if (isTrial && !isActive) {
            await updateSubscriptions(userId, false);
          } else if (!isTrial && !isActive) {
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
        case 'RESTORE_PURCHASES':
          if (isActive) {
            await updateSubscriptions(userId, true);
          } else {
            await updateSubscriptions(userId, false);
          }
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

export const updatePartnershipPurchase = functions.https.onCall(async (data, context) => {
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
