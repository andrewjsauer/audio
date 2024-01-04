import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

import { trackEvent } from '@lib/analytics';

const useAudioRecordingPermission = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  const handlePermissionStatus = (status: string) => {
    setIsPermissionGranted(status === RESULTS.GRANTED);

    if (!isInitialCheck) {
      setPermissionDenied(status === RESULTS.DENIED || status === RESULTS.BLOCKED);
    }
  };

  const checkAudioPermission = async () => {
    const status = await check(PERMISSIONS.IOS.MICROPHONE);
    handlePermissionStatus(status);
    setIsInitialCheck(false);
  };

  const requestAudioPermission = async () => {
    let status = null;

    if (Platform.OS === 'android') {
      status = await requestMultiple([
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);
    } else {
      status = await request(PERMISSIONS.IOS.MICROPHONE);
    }

    handlePermissionStatus(status);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAudioPermission();
      }
    });

    checkAudioPermission();

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePermissionPress = () => {
    if (isPermissionGranted) return;

    if (!isPermissionGranted && permissionDenied) {
      trackEvent('Audio Permission', { status: 'openSettings' });
      openSettings();
    } else {
      trackEvent('Audio Permission', { status: 'request' });
      requestAudioPermission();
    }
  };

  return {
    isPermissionGranted,
    handlePermissionPress,
  };
};

export default useAudioRecordingPermission;
