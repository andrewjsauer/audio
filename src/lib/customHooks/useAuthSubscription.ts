import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { AppDispatch } from '@store/index';
import { setUser } from '@store/auth/slice';
import { updateUser } from '@store/auth/thunks';
import { selectUserId } from '@store/auth/selectors';

function useAuthStateListener() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector(selectUserId);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    if (user) {
      dispatch(setUser(user));
    }
  }

  const handleUpdateLastActiveAt = useCallback(() => {
    if (userId) {
      dispatch(
        updateUser({
          id: userId,
          userDetails: {
            lastActiveAt: firestore.FieldValue.serverTimestamp(),
          },
        }),
      );
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        handleUpdateLastActiveAt();
      }
    });

    return () => {
      handleUpdateLastActiveAt();
      subscription.remove();
    };
  }, [handleUpdateLastActiveAt]);
}

export default useAuthStateListener;
