import { NativeModules, Platform } from 'react-native';

if (__DEV__) {
  if (Platform.OS === 'ios') {
    NativeModules.DevSettings.setIsDebuggingRemotely(false);
  } else {
    import('./reactotron').then(() => console.log('Reactotron configured'));
  }
}
