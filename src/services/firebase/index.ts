import '@react-native-firebase/app';
import { firebase } from '@react-native-firebase/app-check';

import Config from 'react-native-config';

const rnfbProvider = firebase
  .appCheck()
  .newReactNativeFirebaseAppCheckProvider();

rnfbProvider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
    debugToken: Config.appCheckAndroidDebugToken,
  },
  apple: {
    provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
    debugToken: Config.appCheckiOSDebugToken,
  },
});

firebase.appCheck().initializeAppCheck({
  provider: rnfbProvider,
  isTokenAutoRefreshEnabled: true,
});

// const testAppCheck = async () => {
//   try {
//     const { token } = await firebase.appCheck().getToken(true);

//     if (token.length > 0) {
//       console.log('AppCheck verification passed', token);
//     }
//   } catch (error) {
//     console.log('AppCheck verification failed', error);
//   }
// };

// import auth from '@react-native-firebase/auth';
// import analytics from '@react-native-firebase/analytics';
// import crashlytics from '@react-native-firebase/crashlytics';
// import messaging from '@react-native-firebase/messaging';
// import remoteConfig from '@react-native-firebase/remote-config';

// export const firebaseAuth = auth();
// export const firebaseAnalytics = analytics();
// export const firebaseCrashlytics = crashlytics();
// export const firebaseMessaging = messaging();
// export const firebaseRemoteConfig = remoteConfig();
