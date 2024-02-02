import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import { UserDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { setUserData } from '@store/auth/slice';
import { initializeSession, signOut } from '@store/app/thunks';

import {
  selectUser,
  selectUserId,
  selectHasSubscribed,
  selectIsUserRegistered,
} from '@store/auth/selectors';
import { trackEvent, trackIdentify } from '@lib/analytics';

import usePartnerSubscription from '@lib/customHooks/usePartnerSubscription';
import usePartnershipSubscription from '@lib/customHooks/usePartnershipSubscription';
import useAppVersionCheck from '@lib/customHooks/useAppVersionCheck';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);
  const hasUserSubscribed = useSelector(selectHasSubscribed);
  const isUserRegistered = useSelector(selectIsUserRegistered);

  useAuthSubscription();

  useAppVersionCheck();

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
          } else if (snapshot && snapshot.empty && hasUserSubscribed && isUserRegistered) {
            trackEvent('User Partnership Deletion Detected');

            dispatch(
              signOut({
                isDelete: true,
                userId,
              }),
            );
          }
        });

      dispatch(initializeSession(user));
    }

    return () => {
      userUnsubscribe();
    };
  }, [userId, hasUserSubscribed, isUserRegistered]);

  usePartnerSubscription();

  usePartnershipSubscription();
};

export default useInitializeSession;
