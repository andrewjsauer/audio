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
