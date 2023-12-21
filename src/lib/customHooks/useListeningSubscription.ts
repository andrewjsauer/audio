import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import {
  setPartnerReactionToUser,
  setUserReactionToPartner,
} from '@store/recording/slice';
import { UserDataType, ListeningType } from '@lib/types';

type UseListeningSubscriptionProps = {
  userData: UserDataType;
  partnerData: UserDataType | null;
  partnerRecordingId: string | null;
  userRecordingId: string | null;
};

const useListeningSubscription = ({
  userData,
  partnerData,
  partnerRecordingId,
  userRecordingId,
}: UseListeningSubscriptionProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let userRecordingUnsubscribe = () => {};
    let partnerRecordingUnsubscribe = () => {};

    if (userData && partnerRecordingId) {
      userRecordingUnsubscribe = firestore()
        .collection('listenings')
        .where('userId', '==', userData.id)
        .where('recordingId', '==', partnerRecordingId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const latestListening = snapshot.docs[0].data() as ListeningType;
            dispatch(setUserReactionToPartner(latestListening));
          } else if (snapshot && snapshot.empty) {
            dispatch(setUserReactionToPartner(null));
          }
        });
    }

    if (partnerData && userRecordingId) {
      partnerRecordingUnsubscribe = firestore()
        .collection('listenings')
        .where('userId', '==', partnerData.id)
        .where('recordingId', '==', userRecordingId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const latestListening = snapshot.docs[0].data() as ListeningType;
            dispatch(setPartnerReactionToUser(latestListening));
          } else if (snapshot && snapshot.empty) {
            dispatch(setPartnerReactionToUser(null));
          }
        });
    }

    return () => {
      userRecordingUnsubscribe();
      partnerRecordingUnsubscribe();
    };
  }, [userData, partnerData, partnerRecordingId, userRecordingId, dispatch]);

  return null;
};

export default useListeningSubscription;
