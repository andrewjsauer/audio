import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch } from '@store/index';
import { initializeSubscriber } from '@store/app/thunks';

const useFetchQuestion = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        dispatch(initializeSubscriber({ shouldFetchPartnership: true }));
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const focusListener = navigation.addListener('focus', () => {
      dispatch(initializeSubscriber({ shouldFetchPartnership: true }));
    });

    return focusListener;
  }, []);
};

export default useFetchQuestion;
