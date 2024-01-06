import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch } from '@store/index';
import { initializeSubscriber } from '@store/app/thunks';

const useFetchQuestion = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isFirstMount, setIsFirstMount] = useState(true);

  const hasInitializedRef = useRef(false);
  const navigation = useNavigation();

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (isFirstMount) return;

      if (nextAppState === 'active' && !hasInitializedRef.current) {
        dispatch(initializeSubscriber());
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
      if (!hasInitializedRef.current) {
        dispatch(initializeSubscriber());
        hasInitializedRef.current = true;
      }
    });

    const blurListener = navigation.addListener('blur', () => {
      hasInitializedRef.current = false;
    });

    return () => {
      focusListener();
      blurListener();
    };
  }, []);
};

export default useFetchQuestion;
