import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';

import { selectPartnershipTimeZone } from '@store/partnership/selectors';

import { setUserRecording, setPartnerRecording } from '@store/recording/slice';
import { UserDataType, RecordingType } from '@lib/types';
import { formatCreatedAt } from '@lib/dateUtils';

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
  const timeZone = useSelector(selectPartnershipTimeZone);

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
            const payload = {
              ...latestRecording,
              createdAt: formatCreatedAt(latestRecording.createdAt, timeZone),
            };

            dispatch(setUserRecording(payload));
          } else {
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
            const payload = {
              ...latestRecording,
              createdAt: formatCreatedAt(latestRecording.createdAt, timeZone),
            };

            dispatch(setPartnerRecording(payload));
          } else {
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
