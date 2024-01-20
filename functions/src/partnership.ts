import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { v4 as uuidv4 } from 'uuid';

import { trackEvent } from './analytics';

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

export const generatePartnership = functions.https.onCall(async (data, context) => {
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

    trackEvent('Account Created', userId, {
      ...userPayload,
    });

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

export const updateNewUser = functions.https.onCall(async (data, context) => {
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

    trackEvent('Account Created', id, {
      ...userPayload,
    });

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

export const deletePartnership = functions.https.onCall(async (data, context) => {
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
