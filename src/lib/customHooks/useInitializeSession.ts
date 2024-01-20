import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import { UserDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { setUserData } from '@store/auth/slice';
import { initializeSession } from '@store/app/thunks';

import { selectUserId, selectUser } from '@store/auth/selectors';
import { trackIdentify } from '@lib/analytics';

import usePartnerSubscription from '@lib/customHooks/usePartnerSubscription';
import usePartnershipSubscription from '@lib/customHooks/usePartnershipSubscription';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);

  useAuthSubscription();

  useEffect(() => {
    let userUnsubscribe = () => {};

    if (userId) {
      userUnsubscribe = firestore()
        .collection('users')
        .where('id', '==', userId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const data = snapshot.docs[0].data() as UserDataType;

            dispatch(setUserData(data));
            trackIdentify(data);
          }
        });

      dispatch(initializeSession(user));
    }

    return () => {
      userUnsubscribe();
    };
  }, [userId, dispatch]);

  usePartnerSubscription();

  usePartnershipSubscription();
};

export default useInitializeSession;
