import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Analytics } from '@segment/analytics-node';
import moment from 'moment-timezone';

const analytics = new Analytics({ writeKey: 'YTjDLAuvTCgL3NsXukzxqmRuN9Sa1DgM' });

const convertToDate = (timestamp: any) => {
  if (!timestamp) return null;
  const seconds = timestamp.seconds || timestamp._seconds;
  return seconds ? moment.unix(seconds).toDate() : null;
};

export const trackEvent = (event: string, userId: string, properties?: any) => {
  analytics.track({
    userId,
    event,
    properties,
  });
};

export const trackNewUserCreatedEvent = functions.firestore
  .document('users/{userId}')
  .onCreate((snap) => {
    const newUser = snap.data();

    const {
      birthDate,
      createdAt,
      hasSubscribed,
      isRegistered,
      isSubscribed,
      lastActiveAt,
      name,
      partnershipId,
      phoneNumber,
      id,
    } = newUser;

    const birthDateConverted = convertToDate(birthDate);
    const createdAtConverted = convertToDate(createdAt);
    const lastActiveAtConverted = convertToDate(lastActiveAt);

    const traits = {
      birthDate: birthDateConverted,
      createdAt: createdAtConverted,
      hasSubscribed,
      isRegistered,
      isSubscribed,
      lastActiveAt: lastActiveAtConverted,
      name,
      partnershipId,
      phoneNumber,
      id,
    };

    analytics.identify({
      userId: id,
      traits,
    });

    trackEvent('New User Created', id);

    return Promise.resolve();
  });

const didBothPartnersAnswer = async (partnershipId: string) => {
  try {
    const todayUTC = moment.utc().startOf('day').toDate();
    const tomorrowUTC = moment.utc(todayUTC).add(1, 'days').toDate();

    const startOfDay = admin.firestore.Timestamp.fromDate(todayUTC);
    const endOfDay = admin.firestore.Timestamp.fromDate(tomorrowUTC);

    const recordingsRef = admin.firestore().collection('recordings');
    const query = recordingsRef
      .where('partnershipId', '==', partnershipId)
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<', endOfDay);

    const recordings = await query.get();

    if (recordings.size === 2) {
      recordings.forEach((doc) => {
        const { userId } = doc.data();
        trackEvent('Both Partners Answered', userId);
      });
    }
  } catch (error) {
    functions.logger.error(error);
  }
};

export const trackAnswerRecordedEvent = functions.firestore
  .document('recordings/{recordingId}')
  .onCreate(async (snap) => {
    try {
      const newRecording = snap.data();

      const { userId, createdAt, duration, partnershipId } = newRecording;

      const properties = {
        createdAt: convertToDate(createdAt),
        duration,
        partnershipId,
      };

      trackEvent('New Answer Recorded', userId, properties);

      await didBothPartnersAnswer(partnershipId);
    } catch (error) {
      functions.logger.error('Error in trackAnswerRecordedEvent:', error);
    }

    return null;
  });
