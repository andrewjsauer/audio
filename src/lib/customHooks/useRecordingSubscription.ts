import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { setUserRecording, setPartnerRecording } from '@store/recording/slice';
import { UserDataType, RecordingType } from '@lib/types';

type UseRecordingSubscriptionProps = {
  userData: UserDataType;
  partnerData: UserDataType;
  questionId: string;
};

const useRecordingSubscription = ({
  userData,
  partnerData,
  questionId,
}: UseRecordingSubscriptionProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let userRecordingUnsubscribe = () => {};
    let partnerRecordingUnsubscribe = () => {};

    if (userData && questionId) {
      userRecordingUnsubscribe = firestore()
        .collection('recordings')
        .where('userId', '==', userData.id)
        .where('questionId', '==', questionId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const latestRecording = snapshot.docs[0].data() as RecordingType;
            dispatch(setUserRecording(latestRecording));
          } else if (snapshot && snapshot.empty) {
            dispatch(setUserRecording(null));
          }
        });
    }

    if (partnerData && questionId) {
      partnerRecordingUnsubscribe = firestore()
        .collection('recordings')
        .where('userId', '==', partnerData.id)
        .where('questionId', '==', questionId)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const latestRecording = snapshot.docs[0].data() as RecordingType;
            dispatch(setPartnerRecording(latestRecording));
          } else if (snapshot && snapshot.empty) {
            dispatch(setPartnerRecording(null));
          }
        });
    }

    return () => {
      userRecordingUnsubscribe();
      partnerRecordingUnsubscribe();
    };
  }, [userData, partnerData, questionId, dispatch]);

  return null;
};

export default useRecordingSubscription;
