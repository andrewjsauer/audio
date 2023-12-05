import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import crashlytics from '@react-native-firebase/crashlytics';
import { View, Text, Button, useColorScheme } from 'react-native';

import { logout } from '@store/auth/thunks';
import {
  selectError,
  selectIsLoading,
  selectIsUserLoggedIn,
} from '@store/auth/selectors';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';

import { StyledSafeAreaView } from './style';

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
    dispatch(logout());
  };

  const isDarkMode = useColorScheme() === 'dark';
  let content;

  if (isLoading) {
    content = (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    content = (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  if (isUserLoggedIn) {
    content = (
      <View>
        <Text>Please log in.</Text>
      </View>
    );
  }

  content = (
    <View>
      <Text>Welcome {user?.email ?? 'TEST EMAIL'}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );

  return (
    <StyledSafeAreaView theme={{ isDarkMode }}>{content}</StyledSafeAreaView>
  );
}

export default App;
