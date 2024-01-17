import * as functions from 'firebase-functions';
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

exports.sendNewUserCreatedEvent = functions.firestore
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
