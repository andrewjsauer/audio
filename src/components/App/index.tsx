import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import crashlytics from '@react-native-firebase/crashlytics';

import {
  selectIsUserLoggedIn,
  selectIsUserRegistered,
} from '@store/app/selectors';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import HomeScreen from '@components/shared/HomeScreen';

import SignInScreen from '../SignInScreen';

function App(): JSX.Element {
  useEffect(() => {
    crashlytics().log('App mounted.');
  }, []);

  useAuthSubscription();

  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  const isUserAlreadyRegistered = useSelector(selectIsUserRegistered);

  if (isUserLoggedIn && isUserAlreadyRegistered) {
    return <HomeScreen />;
  }

  return <SignInScreen />;
}

export default App;
