import { createClient } from '@segment/analytics-react-native';
import Config from 'react-native-config';

let analyticsInstance: any | null = null;

export const initializeAnalytics = (userId?: string) => {
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

    if (userId) analyticsInstance.identify(userId);
  } catch (error) {
    if (error instanceof Error) {
      console.log('initializeAnalytics error', error.message);
    } else {
      console.log('initializeAnalytics error', error);
    }
  }
};

export const trackScreen = (screen: string) => {
  if (!analyticsInstance || __DEV__) {
    console.log('Analytics Screen', screen);
    return;
  }

  try {
    analyticsInstance.screen(screen);
  } catch (error) {
    if (error instanceof Error) {
      console.log('trackScreen error', error.message);
    } else {
      console.log('trackScreen error', error);
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
