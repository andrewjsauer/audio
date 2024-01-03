import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch } from '@store/index';
import { fetchLatestQuestion } from '@store/question/thunks';
import { PartnershipDataType, UserDataType, QuestionType } from '@lib/types';

const useFetchQuestion = ({
  currentQuestion,
  isLoadingQuestion,
  partnerData,
  partnershipData,
  userData,
}: {
  currentQuestion: QuestionType;
  isLoadingQuestion: boolean;
  partnerData: UserDataType;
  partnershipData: PartnershipDataType;
  userData: UserDataType;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const checkQuestion = useCallback(() => {
    if (!partnershipData || !partnerData || !userData || isLoadingQuestion) return;

    dispatch(fetchLatestQuestion({ partnershipData }));
  }, [partnershipData, partnerData, userData, currentQuestion, isLoadingQuestion, dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkQuestion();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkQuestion]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      checkQuestion();
    });

    return focusListener;
  }, [navigation, checkQuestion]);
};

export default useFetchQuestion;
