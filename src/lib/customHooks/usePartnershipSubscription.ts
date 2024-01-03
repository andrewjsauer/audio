import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { PartnershipDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { selectUserData } from '@store/auth/selectors';
import { setPartnershipData } from '@store/partnership/slice';

const usePartnershipSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector(selectUserData);

  useEffect(() => {
    let partnershipUnsubscribe = () => {};

    if (userData) {
      partnershipUnsubscribe = firestore()
        .collection('partnership')
        .where('id', '==', userData.partnershipId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const data = snapshot.docs[0].data() as PartnershipDataType;
            const payload = {
              ...data,
              startDate: new Date(data.startDate._seconds * 1000),
              createdAt: new Date(data.createdAt._seconds * 1000),
            };

            dispatch(setPartnershipData(payload));
          }
        });
    }

    return () => {
      partnershipUnsubscribe();
    };
  }, [userData, dispatch]);
};

export default usePartnershipSubscription;
