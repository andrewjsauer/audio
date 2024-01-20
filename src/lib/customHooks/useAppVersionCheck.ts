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
import { selectIsUserLoggedIn } from '@store/auth/selectors';
import { selectShouldUpdateApp } from '@store/app/selectors';

const useAppVersionCheck = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const deviceVersion = DeviceInfo.getVersion();

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [cloudVersion, setCloudVersion] = useState('');

  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  const shouldUpdateApp = useSelector(selectShouldUpdateApp);

  const compareVersions = (cloud: string) => {
    const needUpdate = semver.lt(deviceVersion, cloud); // device < cloud

    dispatch(shouldUpdateAppVersion(needUpdate));
    setIsPromptOpen(needUpdate);
    setCloudVersion(cloud);

    trackEvent('app_version_check', { deviceVersion, cloudVersion: cloud });
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
    if (!cloudVersion) return;
    const needUpdate = semver.lt(deviceVersion, cloudVersion); // device < cloud

    dispatch(shouldUpdateAppVersion(needUpdate));
    setIsPromptOpen(needUpdate);

    if (needUpdate) promptForUpdate();
  }, [deviceVersion, cloudVersion]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && shouldUpdateApp && !isPromptOpen) {
        promptForUpdate();
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [shouldUpdateApp, isPromptOpen]);

  useEffect(() => {
    let unsubscribe = () => {};

    if (isUserLoggedIn) {
      unsubscribe = firestore()
        .collection('app')
        .doc('dailyQCouplesEdition')
        .onSnapshot(
          (snapshot) => {
            if (snapshot && snapshot.exists) {
              setTimeout(() => {
                const data = snapshot.data();
                compareVersions(data?.version);
              }, 1000 * 10); // 10 seconds
            }
          },
          (error) => trackEvent('app_version_check_error', { error: error.message }),
        );
    }

    return () => unsubscribe();
  }, [isUserLoggedIn]);

  return null;
};

export default useAppVersionCheck;
