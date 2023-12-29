/* eslint-disable no-underscore-dangle */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import { startOfDay } from 'date-fns';
import i18n from 'i18next';

import {
  selectPartnerData,
  selectPartnershipData,
  selectIsLoading,
} from '@store/partnership/selectors';
import { selectUserData } from '@store/auth/selectors';
import { setLoading, setQuestion } from '@store/question/slice';
import { setError } from '@store/partnership/slice';
import { setUserReactionToPartner, setPartnerReactionToUser } from '@store/recording/slice';

import { trackEvent } from '@lib/analytics';
import { QuestionType } from '@lib/types';

const useQuestionSubscription = () => {
  const dispatch = useDispatch();

  const partnershipData = useSelector(selectPartnershipData);
  const partnerData = useSelector(selectPartnerData);
  const userData = useSelector(selectUserData);
  const isLoading = useSelector(selectIsLoading);

  const formatQuestion = (data: QuestionType) => ({
    ...data,
    createdAt: new Date(data.createdAt._seconds * 1000),
  });

  const processQuestion = (doc) => {
    const data = doc.data();
    return formatQuestion({ ...data, id: doc.id });
  };

  const generateQuestion = async (payload: any) => {
    dispatch(setLoading(true));

    try {
      const { data } = await functions().httpsCallable('generateQuestion')({
        ...payload,
      });

      return formatQuestion(data);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const storeLatestQuestion = (question: QuestionType) => {
    dispatch(setQuestion(question));
    dispatch(setUserReactionToPartner(null));
    dispatch(setPartnerReactionToUser(null));
  };

  useEffect(() => {
    let questionUnsubscribe = () => {};

    const partnershipPayload = {
      ...partnershipData,
      startDate: partnershipData?.startDate?._seconds
        ? new Date(partnershipData.startDate._seconds * 1000)
        : partnershipData?.startDate,
    };

    if (partnershipData && partnerData && userData && !isLoading) {
      const today = startOfDay(new Date());

      questionUnsubscribe = firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipData.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot(
          async (snapshot) => {
            try {
              if (snapshot.empty) {
                trackEvent('question_not_found');

                const newQuestion = await generateQuestion({
                  partnerData,
                  partnershipData: partnershipPayload,
                  userData,
                  usersLanguage: i18n.language,
                });

                storeLatestQuestion(newQuestion);
              } else {
                const latestQuestion = processQuestion(snapshot.docs[0]);

                if (latestQuestion.createdAt >= today) {
                  trackEvent('question_within_date_limit');
                  storeLatestQuestion(latestQuestion);
                } else {
                  trackEvent('question_out_of_date');
                  const newQuestion = await generateQuestion({
                    partnerData,
                    partnershipData: partnershipPayload,
                    userData,
                    usersLanguage: i18n.language,
                  });

                  storeLatestQuestion(newQuestion);
                }
              }
            } catch (err) {
              crashlytics().recordError(err);
              trackEvent('question_fetch_error', { error: err.message });
              dispatch(setError('errors.fetchQuestionAPIError'));
            } finally {
              dispatch(setLoading(false));
            }
          },
          (err) => {
            crashlytics().recordError(err);
            dispatch(setError('errors.fetchQuestionAPIError'));
            dispatch(setLoading(false));
          },
        );
    }

    return () => questionUnsubscribe();
  }, [partnershipData, partnerData, userData]);

  return null;
};

export default useQuestionSubscription;
