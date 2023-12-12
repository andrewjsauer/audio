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
import { trackEvent } from '@lib/analytics';

import { showNotification } from '@store/ui/slice';

const useNotificationPermissions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const partnersName = 'Placeholder';
  // useSelector(selectPartnersName);

  const handleNotificationPermission = (status: PermissionStatus) => {
    if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
      dispatch(
        showNotification({
          title: partnersName
            ? t('permissions.notifications.title', { name: partnersName })
            : t('permissions.notifications.titleNameBackup'),
          description: t('permissions.notifications.description'),
          type: 'error',
          buttonText: t('permissions.notifications.buttonText'),
          onButtonPress: openSettings,
        }),
      );

      trackEvent('notification_permission_denied_shown');
    } else {
      dispatch(
        showNotification({
          title: partnersName
            ? t('permissions.notifications.title', { name: partnersName })
            : t('permissions.notifications.titleNameBackup'),
          description: t('permissions.notifications.description'),
          type: 'error',
          buttonText: t('permissions.notifications.buttonText'),
          onButtonPress: () =>
            requestNotifications(['alert', 'badge', 'providesAppSettings']),
        }),
      );

      trackEvent('notification_permission_shown');
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
