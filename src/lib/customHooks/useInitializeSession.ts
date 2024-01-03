import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import { UserDataType } from '@lib/types';
import usePartnerSubscription from '@lib/customHooks/usePartnerSubscription';

import { AppDispatch } from '@store/index';
import { selectUserId, selectUser } from '@store/auth/selectors';
import { initializeSession } from '@store/app/thunks';
import { setUserData } from '@store/auth/slice';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    let userUnsubscribe = () => {};

    if (userId) {
      userUnsubscribe = firestore()
        .collection('users')
        .where('id', '==', userId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const userData = snapshot.docs[0].data() as UserDataType;
            dispatch(setUserData(userData));
          }
        });

      dispatch(initializeSession(user));
    }

    return () => {
      userUnsubscribe();
    };
  }, [userId, dispatch]);

  useAuthSubscription();

  usePartnerSubscription();
};

export default useInitializeSession;
