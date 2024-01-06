import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { PartnershipDataType } from '@lib/types';

import { AppDispatch } from '@store/index';
import { setPartnershipData } from '@store/partnership/slice';
import { selectPartnershipUserData } from '@store/partnership/selectors';

const usePartnershipSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const partnershipUserData = useSelector(selectPartnershipUserData);

  useEffect(() => {
    let partnershipUnsubscribe = () => {};

    if (partnershipUserData) {
      partnershipUnsubscribe = firestore()
        .collection('partnership')
        .where('id', '==', partnershipUserData.partnershipId)
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
  }, [partnershipUserData]);
};

export default usePartnershipSubscription;
