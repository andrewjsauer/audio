import analytics from '@react-native-firebase/analytics';

export const trackScreen = async (screen: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screen,
    });
  } catch (error) {
    console.log('trackScreen error', error);
  }
};

export const trackEvent = async (event, options = {}) => {
  try {
    await analytics().logEvent(event, options);
  } catch (error) {
    console.log('trackEvent error', error);
  }
};
