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

  const handlePermissionStatus = (status: any) => {
    if (Platform.OS === 'android') {
      const allPermissionsGranted = Object.values(status).every(
        (result) => result === RESULTS.GRANTED,
      );
      setIsPermissionGranted(allPermissionsGranted);
    } else {
      setIsPermissionGranted(status === RESULTS.GRANTED);
    }

    if (!isInitialCheck) {
      const permission =
        Platform.OS === 'android'
          ? Object.values(status).some(
              (result) => result === RESULTS.DENIED || result === RESULTS.BLOCKED,
            )
          : status === RESULTS.DENIED || status === RESULTS.BLOCKED;
      setPermissionDenied(permission);
    }
  };

  const checkAudioPermission = async () => {
    let status;

    if (Platform.OS === 'android') {
      const writeStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      const readStatus = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      const recordStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);

      status = {
        [PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]: writeStatus,
        [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]: readStatus,
        [PERMISSIONS.ANDROID.RECORD_AUDIO]: recordStatus,
      };
    } else {
      status = await check(PERMISSIONS.IOS.MICROPHONE);
    }

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
