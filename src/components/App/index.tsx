import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import crashlytics from '@react-native-firebase/crashlytics';

import { signOut } from '@store/app/thunks';
import {
  selectError,
  selectIsLoading,
  selectIsUserLoggedIn,
  selectIsUserRegistered,
} from '@store/app/selectors';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';
import SettingsIcon from '@assets/icons/settings.svg';

import { StyledView, StyledText, LogoutButton } from './style';
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
  const isUserAlreadyRegistered = useSelector(selectIsUserRegistered);

  const handleLogout = () => {
    dispatch(signOut());
  };

  if (isLoading) {
    return (
      <StyledView>
        <StyledText>Loading...</StyledText>
      </StyledView>
    );
  }

  if (error) {
    return (
      <StyledView>
        <StyledText>Error: {error}</StyledText>
      </StyledView>
    );
  }

  if (isUserLoggedIn && isUserAlreadyRegistered) {
    // lets setup a subscriber when logged in for the partners data since that is where we will
    // be updating the most

    return (
      <StyledView>
        <LogoutButton onPress={handleLogout}>
          <SettingsIcon width={20} height={20} />
        </LogoutButton>
        <StyledText>You are logged in</StyledText>
      </StyledView>
    );
  }

  return <SignInScreen />;
}

export default App;
