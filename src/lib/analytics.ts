import analytics from '@react-native-firebase/analytics';

export const trackScreen = async (screen: string) => {
  try {
    console.log('SCREEN', screen);

    await analytics().logScreenView({
      screen_name: screen,
    });
  } catch (error) {
    console.log('trackScreen error', error);
  }
};

export const trackEvent = async (event, options = {}) => {
  try {
    console.log('EVENT', event, options);

    await analytics().logEvent(event, options);
  } catch (error) {
    console.log('trackEvent error', error);
  }
};
