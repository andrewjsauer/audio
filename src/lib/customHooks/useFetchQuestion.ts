import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { setQuestion } from '@store/question/slice';

import { AppDispatch } from '@store/index';
import { initializeSubscriber } from '@store/app/thunks';

const useFetchQuestion = (partnershipId: string | null) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  const hasInitializedRef = useRef(false);
  const navigation = useNavigation();

  useEffect(() => {
    let questionUnsubscribe = () => {};

    if (partnershipId) {
      questionUnsubscribe = firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
          if (snapshot && !snapshot.empty) {
            const question = snapshot.docs[0].data();
            dispatch(setQuestion(question));
          }
        });
    }

    return () => {
      questionUnsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (isFirstMount) return;
      setAppState(nextAppState);

      if (nextAppState === 'active' && !hasInitializedRef.current) {
        dispatch(initializeSubscriber());
        hasInitializedRef.current = true;
      } else if (nextAppState === 'background') {
        hasInitializedRef.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isFirstMount]);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      if (appState === 'active' && !hasInitializedRef.current) {
        dispatch(initializeSubscriber());
      }
    });

    const blurListener = navigation.addListener('blur', () => {
      hasInitializedRef.current = false;
    });

    return () => {
      focusListener();
      blurListener();
    };
  }, [appState]);

  return null;
};

export default useFetchQuestion;
