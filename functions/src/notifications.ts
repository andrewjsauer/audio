import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import moment from 'moment-timezone';

import { formatCreatedAt } from './utils/dateUtils';

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
  questionId: string,
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
    const recordingsSnapshot = await db
      .collection('recordings')
      .where('questionId', '==', questionId)
      .get();

    const areRecordingsEmpty = recordingsSnapshot.empty;
    const recordings = !areRecordingsEmpty ? recordingsSnapshot.docs.map((doc) => doc.data()) : [];
    const hasUserRecorded = recordings.some((recording) => recording.userId === userId);

    const usersLastActiveAt = userData.lastActiveAt?._seconds || userData.lastActiveAt?.seconds;
    const lastActiveAt = moment(usersLastActiveAt * 1000).tz(timeZone);
    const startOfToday = moment().tz(timeZone).startOf('day');

    if (lastActiveAt.isBefore(startOfToday) || !hasUserRecorded) {
      let body = 'Today’s question is ready!';
      let apnsPayload;

      if (userData.partnershipId) {
        const queriedDescQuestionSnapshot = await db
          .collection('questions')
          .where('partnershipId', '==', userData.partnershipId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!queriedDescQuestionSnapshot.empty) {
          const questionSnapshot = queriedDescQuestionSnapshot.docs[0];
          const questionData = questionSnapshot.data();

          const today = startOfToday.toDate();
          const questionCreatedAtLocal = formatCreatedAt(questionData.createdAt, timeZone);

          if (questionCreatedAtLocal >= today) {
            body = questionData.text || 'Today’s question is ready!';
            apnsPayload = questionData.text
              ? {
                  apns: {
                    payload: {
                      aps: {
                        alert: {
                          subtitle: '✨ Question of the Day ✨',
                        },
                      },
                    },
                  },
                }
              : undefined;
          }
        }
      }

      const response = await admin.messaging().sendEachForMulticast({
        tokens: userData.deviceIds,
        notification: {
          title: 'Daily Q’s',
          body,
        },
        ...apnsPayload,
      });

      functions.logger.info(
        `Afternoon reminder sent successfully for user: ${userId}, body: ${body}, response: ${JSON.stringify(
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

async function sendEveningReminderNotification(userData: any, timeZone: string) {
  if (
    (!userData && !userData.deviceIds) ||
    userData.deviceIds.length === 0 ||
    !userData.isRegistered
  )
    return;

  const db = admin.firestore();

  const startOfToday = moment().tz(timeZone).startOf('day');
  const { id: userId, partnershipId, deviceIds } = userData;

  let body = 'Don’t forget to answer!';
  let apnsPayload;

  if (partnershipId) {
    const queriedDescQuestionSnapshot = await db
      .collection('questions')
      .where('partnershipId', '==', partnershipId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!queriedDescQuestionSnapshot.empty) {
      const questionSnapshot = queriedDescQuestionSnapshot.docs[0];
      const questionData = questionSnapshot.data();

      const today = startOfToday.toDate();
      const questionCreatedAtLocal = formatCreatedAt(questionData.createdAt, timeZone);

      if (questionCreatedAtLocal >= today) {
        body = questionData.text || '✨ Don’t forget to answer! ✨';
        apnsPayload = questionData.text
          ? {
              apns: {
                payload: {
                  aps: {
                    alert: {
                      subtitle: '✨ Don’t forget to answer! ✨',
                    },
                  },
                },
              },
            }
          : undefined;
      }
    }
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens: deviceIds,
    notification: {
      title: 'Daily Q’s',
      body,
    },
    ...apnsPayload,
  });

  functions.logger.info(
    `Evening reminder sent successfully for user: ${userId}, body: ${body}, response: ${JSON.stringify(
      response,
    )}`,
  );
}

async function sendPartnerRecordingReminder(userData: any, partnerId: string) {
  let partnerName = 'Your partner';

  try {
    const partnerSnapshot = await admin.firestore().collection('users').doc(partnerId).get();
    if (!partnerSnapshot.exists) return;

    const partnerData = partnerSnapshot.data();
    partnerName = partnerData?.name ?? 'Your partner';

    functions.logger.info(`Partner name: ${partnerName}`);
  } catch (error) {
    functions.logger.error(`Error getting partner: ${partnerId}`, error);
    return;
  }

  if (!userData.deviceIds || userData.deviceIds?.length === 0) return;

  await admin.messaging().sendEachForMulticast({
    tokens: userData.deviceIds,
    notification: {
      title: `Daily Q’s`,
      body: `Record and listen to ${partnerName}'s answer!`,
    },
  });

  functions.logger.info(
    `Evening partner recording reminder notification sent for user: ${userData.id} to ${partnerName}`,
  );
}

async function checkUserActivity(userDoc: any, timeZone: string) {
  const userId = userDoc.data()?.userId;
  if (!userId) {
    functions.logger.info('User ID not found in document');
    return { userId, userData: null, active: false };
  }

  let userSnapshot;

  try {
    userSnapshot = await admin.firestore().collection('users').doc(userId).get();
    if (!userSnapshot.exists) return { userId, userData: null, active: false };
  } catch (error) {
    functions.logger.error(`Error getting user: ${userId}`, error);
    return { userId, userData: null, active: false };
  }

  const userData = userSnapshot.data() as any;
  if (!userData.isSubscribed || !userData.lastActiveAt) {
    return { userId, userData: null, active: false };
  }

  const usersLastActiveAt = userData.lastActiveAt?._seconds || userData.lastActiveAt?.seconds;

  const lastActiveAt = moment(usersLastActiveAt * 1000).tz(timeZone);
  const startOfToday = moment().tz(timeZone).startOf('day');

  return { userId, userData, active: lastActiveAt.isSameOrAfter(startOfToday) };
}

async function sendInactivePartnerReminder(
  activeUserData: any,
  inactiveUserData: any,
  latestQuestionId: string,
  timeZone: string,
) {
  const db = admin.firestore();
  let questionData = null;

  try {
    if (!inactiveUserData) {
      functions.logger.info('Inactive user not found');
      return;
    }

    const questionSnapshot = await db.collection('questions').doc(latestQuestionId).get();

    if (!questionSnapshot.exists) {
      functions.logger.info(`Question not found: ${latestQuestionId}`);
      return;
    }

    questionData = questionSnapshot.data() as any;
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
    await Promise.all([
      sendEveningReminderNotification(inactiveUserData, timeZone),
      sendEveningReminderNotification(activeUserData, timeZone),
    ]);

    return;
  }

  const recordings = !recordingSnapshot.empty
    ? recordingSnapshot.docs.map((doc) => doc.data())
    : [];

  const hasActiveUserRecorded = recordings.some(
    (recording) => recording.userId === activeUserData.id,
  );

  if (!hasActiveUserRecorded) {
    functions.logger.info('Active user has not recorded');
    await sendEveningReminderNotification(activeUserData, timeZone);
  }

  await Promise.all(
    recordingSnapshot.docs.map(async (doc) => {
      const recordingData = doc.data();

      if (recordingData.userId !== inactiveUserData.id) {
        await sendPartnerRecordingReminder(inactiveUserData, recordingData.userId);
      }
    }),
  );
}

async function checkAndSendRecordingReminders(
  activeUsers: any,
  latestQuestionId: string,
  timeZone: string,
) {
  try {
    const db = admin.firestore();
    const recordingsSnapshot = await db
      .collection('recordings')
      .where('questionId', '==', latestQuestionId)
      .get();

    if (recordingsSnapshot.empty) {
      functions.logger.info('No recordings found');

      await Promise.all(
        activeUsers.map((user: any) => sendEveningReminderNotification(user.userData, timeZone)),
      );

      return;
    }

    functions.logger.info('Recordings found');
    const recordedUserIds = recordingsSnapshot.docs.map((doc) => doc.data().userId);

    if (recordingsSnapshot.docs.length === 1) {
      functions.logger.info('One recording found');

      const userToNotify = activeUsers.find(
        (user: any) => !recordedUserIds.includes(user.userData.id),
      );

      if (userToNotify) {
        const userWhoRecorded = activeUsers.find((user: any) =>
          recordedUserIds.includes(user.userData.id),
        );

        if (userWhoRecorded) {
          functions.logger.info(
            `Sending recording reminder to user: ${userToNotify.userData.id} for user: ${userWhoRecorded.userData.id}`,
          );

          await sendPartnerRecordingReminder(userToNotify.userData, userWhoRecorded.userData.id);
        }
      }
    }
  } catch (error) {
    functions.logger.error(`Error getting recordings for question: ${latestQuestionId}`, error);
  }
}

async function handleEveningLogic(
  partnershipUsers: any,
  timeZone: string,
  latestQuestionId: string,
) {
  const userActivityPromises = partnershipUsers.docs.map((userDoc: any) =>
    checkUserActivity(userDoc, timeZone),
  );

  const userActivities = await Promise.all(userActivityPromises);

  const activeUsers = userActivities.filter((activity) => activity.active);
  const inactiveUsers = userActivities.filter((activity) => !activity.active);

  if (inactiveUsers.length === 2) {
    functions.logger.info('Both users are inactive');
    await Promise.all(
      inactiveUsers.map(({ userData }) => {
        if (userData) {
          sendEveningReminderNotification(userData, timeZone);
          return null;
        }

        return null;
      }),
    );
  } else if (inactiveUsers.length === 1) {
    functions.logger.info('One user is inactive');
    await sendInactivePartnerReminder(
      activeUsers[0].userData,
      inactiveUsers[0].userData,
      latestQuestionId,
      timeZone,
    );
  } else if (inactiveUsers.length === 0) {
    functions.logger.info('Both users are active');
    await checkAndSendRecordingReminders(activeUsers, latestQuestionId, timeZone);
  }
}

async function handleAfternoonLogic(
  partnershipUsers: any,
  timeZone: string,
  latestQuestionId: string,
) {
  const notificationPromises = partnershipUsers.docs.map((userDoc: any) =>
    sendAfternoonReminderNotificationIfNeeded(userDoc, timeZone, latestQuestionId),
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
      await handleAfternoonLogic(partnershipUsers, timeZone, latestQuestionId);
    } else if (isEvening) {
      await handleEveningLogic(partnershipUsers, timeZone, latestQuestionId);
    }
  } catch (error) {
    functions.logger.error(`Error processing partnership: ${partnershipId}`, error);
  }
}

export const checkTimeZones = functions.pubsub.schedule('0 * * * *').onRun(async () => {
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

export const sendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
  }

  const { title, body, tokens } = data;
  try {
    await admin.messaging().sendEachForMulticast({
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

export const sendSMS = functions.https.onCall(async (data, context) => {
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
