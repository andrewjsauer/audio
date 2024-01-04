import { createClient } from '@segment/analytics-react-native';
import Config from 'react-native-config';

let analyticsInstance: any | null = null;

export const initializeAnalytics = async (userId?: string): Promise<void> => {
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

export const trackScreen = async (screen: string): Promise<void> => {
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

export const trackEvent = async (event: string, options: EventOptions = {}): Promise<void> => {
  if (!analyticsInstance || __DEV__) {
    console.log('Analytics Track', event, options);
    return;
  }

  try {
    analyticsInstance.track(event, options);
  } catch (error) {
    if (error instanceof Error) {
      console.log('trackEvent error', error.message);
    } else {
      console.log('trackEvent error', error);
    }
  }
};

export const reset = async (): Promise<void> => {
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
