import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'react-native';
import i18n from 'i18next';

import messaging from '@react-native-firebase/messaging';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';

import { AppDispatch } from '@store/index';
import { setUser } from '@store/auth/slice';
import { updateUser } from '@store/auth/thunks';
import { selectUserId } from '@store/auth/selectors';

import { trackEvent } from '@lib/analytics';

function useAuthSubscription() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector(selectUserId);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    if (user) {
      crashlytics().setUserId(user.uid);
      dispatch(setUser(user));
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  async function saveTokenToUser(token: string, id: string | null) {
    if (id) {
      dispatch(
        updateUser({
          id,
          userDetails: {
            deviceIds: firestore.FieldValue.arrayUnion(token),
          },
        }),
      );
    }
  }

  useEffect(() => {
    try {
      messaging()
        .getToken()
        .then((token) => {
          return saveTokenToUser(token, userId);
        });
    } catch (error) {
      trackEvent('Device Token Error', { error: error.message });
      crashlytics().recordError(error);
    }

    return messaging().onTokenRefresh((token) => {
      saveTokenToUser(token, userId);
    });
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        if (userId) {
          dispatch(
            updateUser({
              id: userId,
              userDetails: {
                deviceLanguage: i18n.language,
                lastActiveAt: firestore.FieldValue.serverTimestamp(),
              },
            }),
          );
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId]);
}

export default useAuthSubscription;
