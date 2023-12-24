import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { UserDataType, PartnershipUserDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';
import { setPartnershipUserData, setPartnerData } from '@store/partnership/slice';
import { selectPartnershipUserData } from '@store/partnership/selectors';

const usePartnerSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();

  const userId = useSelector(selectUserId);
  const partnershipUserData = useSelector(selectPartnershipUserData);

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

export default usePartnerSubscription;
