import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
  PermissionStatus,
  openSettings,
} from 'react-native-permissions';
import { useTranslation } from 'react-i18next';

import { selectPartnersName } from '@store/app/selectors';
import { showNotification, hideNotification } from '@store/ui/slice';

const useNotificationPermissions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const partnersName = useSelector(selectPartnersName);

  // Reset partner data, delete DB and restart to make sure partners name goes through
  // Add crashlytics log
  // Add analytics log

  const handleNotificationPermission = (status: PermissionStatus) => {
    if (status === RESULTS.GRANTED) {
      dispatch(hideNotification());
    } else if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
      dispatch(
        showNotification({
          title: t('permissions.notifications.deniedTitle'),
          description: t('permissions.notifications.deniedDescription'),
          type: 'error',
          buttonText: t('permissions.notifications.deniedButtonText'),
          onButtonPress: openSettings,
        }),
      );
    } else {
      dispatch(
        showNotification({
          title: t('permissions.notifications.title', { name: partnersName }),
          description: t('permissions.notifications.description'),
          type: 'error',
          buttonText: t('permissions.notifications.buttonText'),
          onButtonPress: () => {
            try {
              console.log('Requesting notifications');
              requestNotifications(['alert', 'badge', 'providesAppSettings']);
            } catch (error) {
              console.error('Error requesting notifications:', error);
            }
          },
        }),
      );
    }
  };

  const checkNotificationPermission = () => {
    checkNotifications().then(({ status }) => {
      handleNotificationPermission(status);
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotificationPermission();
      }
    });

    checkNotificationPermission();

    return () => {
      subscription.remove();
    };
  }, [dispatch, t]);
};

export default useNotificationPermissions;
