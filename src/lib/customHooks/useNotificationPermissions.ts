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

import { showNotification, hideNotification } from '@store/ui/slice';
import { selectPartnerName } from '@store/partnership/selectors';

const useNotificationPermissions = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const partnersName = useSelector(selectPartnerName);

  const handleNotificationPermission = ({
    status,
    name,
  }: {
    status: PermissionStatus;
    name: string | null;
  }) => {
    if (status === RESULTS.GRANTED) {
      dispatch(hideNotification());
    } else if (status === RESULTS.BLOCKED) {
      dispatch(
        showNotification({
          title: name
            ? t('permissions.notifications.title', { name })
            : t('permissions.notifications.titleNameBackup'),
          description: t('permissions.notifications.description'),
          type: 'error',
          buttonText: t('permissions.notifications.buttonText'),
          onButtonPress: openSettings,
          duration: 'long',
        }),
      );

      trackEvent('notification_permission_denied_shown');
    } else {
      dispatch(
        showNotification({
          title: name
            ? t('permissions.notifications.title', { name })
            : t('permissions.notifications.titleNameBackup'),
          description: t('permissions.notifications.description'),
          type: 'error',
          buttonText: t('permissions.notifications.buttonText'),
          onButtonPress: () => requestNotifications(['alert', 'badge', 'sound', 'carPlay']),
        }),
      );

      trackEvent('notification_permission_shown');
    }
  };

  const checkNotificationPermission = (name: string | null) => {
    checkNotifications().then(({ status }) => {
      handleNotificationPermission({ status, name });
    });
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotificationPermission(partnersName);
      }
    });

    checkNotificationPermission(partnersName);

    return () => {
      subscription.remove();
    };
  }, [partnersName, dispatch, t]);
};

export default useNotificationPermissions;
