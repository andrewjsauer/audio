import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { PartnershipDataType } from '@lib/types';
import { formatCreatedAt } from '@lib/dateUtils';

import { AppDispatch } from '@store/index';
import { setPartnershipData } from '@store/partnership/slice';
import { selectPartnershipUserData, selectPartnershipTimeZone } from '@store/partnership/selectors';

const usePartnershipSubscription = () => {
  const dispatch = useDispatch<AppDispatch>();
  const partnershipUserData = useSelector(selectPartnershipUserData);
  const timeZone = useSelector(selectPartnershipTimeZone);

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
              startDate: formatCreatedAt(data.startDate, timeZone),
              createdAt: formatCreatedAt(data.createdAt, timeZone),
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
