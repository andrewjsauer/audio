import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import crashlytics from '@react-native-firebase/crashlytics';

import { signOut } from '@store/auth/thunks';
import {
  selectError,
  selectIsLoading,
  selectIsUserLoggedIn,
} from '@store/auth/selectors';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';

import { StyledView, StyledText } from './style';
import SignInScreen from '../SignInScreen';

function App(): JSX.Element {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    crashlytics().log('App mounted.');
  }, []);

  useAuthSubscription();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);

  const handleLogout = () => {
    dispatch(signOut());
  };

  let content;
  if (isLoading) {
    content = (
      <StyledView>
        <StyledText>Loading...</StyledText>
      </StyledView>
    );
  }

  if (error) {
    content = (
      <StyledView>
        <StyledText>Error: {error}</StyledText>
      </StyledView>
    );
  }

  if (isUserLoggedIn) {
    content = (
      <StyledView>
        <StyledText>Please log in.</StyledText>
      </StyledView>
    );
  }

  content = <SignInScreen />;
  return content;
}

export default App;
