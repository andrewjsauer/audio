import { createClient } from '@segment/analytics-react-native';
import Config from 'react-native-config';
import moment from 'moment-timezone';

import { UserDataType } from '@lib/types';

let analyticsInstance: any | null = null;

const convertToDate = (timestamp: any) => {
  if (!timestamp) return null;
  const seconds = timestamp.seconds || timestamp._seconds;
  return seconds ? moment.unix(seconds).toDate() : null;
};

export const initializeAnalytics = (userData?: UserDataType | null) => {
  if (__DEV__) return;

  try {
    if (!analyticsInstance) {
      analyticsInstance = createClient({
        writeKey: Config.segmentKey as string,
        trackAppLifecycleEvents: true,
        debug: __DEV__,
      });

      analyticsInstance.flush();
    }

    if (userData) {
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
      } = userData;

      const birthDateConverted = convertToDate(birthDate);
      const createdAtConverted = convertToDate(createdAt);
      const lastActiveAtConverted = convertToDate(lastActiveAt);

      const userId = userData.id;
      analyticsInstance.identify(userId, {
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
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('initializeAnalytics error', error.message);
    } else {
      console.log('initializeAnalytics error', error);
    }
  }
};

export const trackIdentify = (userData: UserDataType) => {
  if (!analyticsInstance || __DEV__) {
    console.log('Analytics Identify', userData);
    return;
  }

  try {
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
    } = userData;

    const birthDateConverted = convertToDate(birthDate);
    const createdAtConverted = convertToDate(createdAt);
    const lastActiveAtConverted = convertToDate(lastActiveAt);

    const userId = userData.id;
    analyticsInstance.identify(userId, {
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
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log('trackIdentify error', error.message);
    } else {
      console.log('trackIdentify error', error);
    }
  }
};

interface EventOptions {
  [key: string]: any;
}

export const trackEvent = (event: string, options?: EventOptions) => {
  if (!analyticsInstance || __DEV__) {
    console.log('Analytics Track', event, options);
    return;
  }

  const properties = options || {};

  try {
    analyticsInstance.track(event, properties);
  } catch (error) {
    if (error instanceof Error) {
      console.log('trackEvent error', error.message);
    } else {
      console.log('trackEvent error', error);
    }
  }
};

export const reset = () => {
  if (!analyticsInstance) {
    console.log('Analytics instance not initialized');
    return;
  }

  try {
    analyticsInstance.reset();
  } catch (error) {
    if (error instanceof Error) {
      console.log('reset error', error.message);
    } else {
      console.log('reset error', error);
    }
  }
};
