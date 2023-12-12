import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import crashlytics from '@react-native-firebase/crashlytics';

import { selectUserData } from '@store/app/selectors';
import { setError, setPartnersData } from '@store/app/slice';

const usePartnerDataSubscription = () => {
  const dispatch = useDispatch();
  const userData = useSelector(selectUserData);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('partners')
      .doc(userData.partnerId)
      .onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            dispatch(setPartnersData(documentSnapshot.data() as object));
          }
        },
        (err) => {
          crashlytics().recordError(err);
          dispatch(setError(err));
        },
      );

    return () => {
      unsubscribe();
    };
  }, [dispatch]);
};

export default usePartnerDataSubscription;
