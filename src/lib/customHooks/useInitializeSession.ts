import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import { UserDataType, PartnershipUserDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { selectUserId, selectUser } from '@store/auth/selectors';
import { initializeSession } from '@store/app/thunks';
import { setUserData } from '@store/auth/slice';
import { selectPartnershipUserData } from '@store/partnership/selectors';
import { setPartnershipUserData, setPartnerData } from '@store/partnership/slice';

const useInitializeSession = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);
  const partnershipUserData = useSelector(selectPartnershipUserData);

  useAuthSubscription();

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

  useEffect(() => {
    let partnershipUserUnsubscribe = () => {};

    if (userId) {
      partnershipUserUnsubscribe = firestore()
        .collection('partnershipUser')
        .where('userId', '==', userId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const data = snapshot.docs[0].data() as PartnershipUserDataType;
            dispatch(setPartnershipUserData(data));
          }
        });
    }

    return () => {
      partnershipUserUnsubscribe();
    };
  }, [userId, dispatch]);

  useEffect(() => {
    let partnerUnsubscribe = () => {};

    if (partnershipUserData) {
      partnerUnsubscribe = firestore()
        .collection('users')
        .where('id', '==', partnershipUserData.otherUserId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const data = snapshot.docs[0].data() as UserDataType;
            dispatch(setPartnerData(data));
          }
        });
    }

    return () => {
      partnerUnsubscribe();
    };
  }, [partnershipUserData, dispatch]);
};

export default useInitializeSession;
