import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import semver from 'semver';

import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { AppState, Alert, Linking, Platform } from 'react-native';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { shouldUpdateAppVersion } from '@store/app/slice';
import { selectShouldUpdateApp } from '@store/app/selectors';

const useAppVersionCheck = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const shouldUpdateApp = useSelector(selectShouldUpdateApp);

  const compareVersions = (cloudVersion: string) => {
    const deviceVersion = DeviceInfo.getVersion();
    trackEvent('app_version_check', { deviceVersion, cloudVersion });

    const needUpdate = semver.lt(deviceVersion, cloudVersion); // device < cloud

    dispatch(shouldUpdateAppVersion(needUpdate));
    setIsPromptOpen(needUpdate);
  };

  const promptForUpdate = () => {
    setIsPromptOpen(true);
    const url = Platform.select({
      ios: 'https://apps.apple.com/us/app/daily-qs-couples-edition/id6474273822',
      android: 'https://play.google.com/store/apps/details?id=[YOUR_APP_PACKAGE_NAME]',
    });

    if (!url) {
      trackEvent('app_version_check_error', {
        error: 'App store URL is not defined for this platform',
      });
      return;
    }

    Alert.alert(
      t('errors.updateApp.title'),
      t('errors.updateApp.description'),
      [
        {
          text: t('errors.updateApp.buttonText'),
          onPress: () =>
            Linking.canOpenURL(url)
              .then((supported) => {
                if (!supported) {
                  trackEvent('app_version_check_error', {
                    error: "Can't handle URL:",
                  });
                  return Promise.reject(new Error(`Can't handle URL: ${url}`));
                }
                setIsPromptOpen(false);
                return Linking.openURL(url);
              })
              .catch((err) => trackEvent('app_version_check_error', { error: err.message })),
        },
      ],
      { cancelable: false },
    );
  };

  useEffect(() => {
    if (shouldUpdateApp) promptForUpdate();
  }, [shouldUpdateApp]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && shouldUpdateApp && !isPromptOpen) {
        promptForUpdate();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [shouldUpdateApp, isPromptOpen]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('app')
      .doc('dailyQCouplesEdition')
      .onSnapshot(
        (snapshot) => {
          if (snapshot && snapshot.exists) {
            const data = snapshot.data();
            compareVersions(data?.version);
          }
        },
        (error) => trackEvent('app_version_check_error', { error: error.message }),
      );
    return () => unsubscribe();
  }, []);

  return null;
};

export default useAppVersionCheck;
