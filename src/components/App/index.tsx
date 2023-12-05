import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { View, Text, Button, useColorScheme } from 'react-native';

import { logout } from '@store/auth/thunks';
import {
  selectIsLoading,
  selectError,
  selectUser,
} from '@store/auth/selectors';

import useAuthSubscription from '@lib/customHooks/useAuthSubscription';

import { StyledSafeAreaView } from './style';

function App(): JSX.Element {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const user = useSelector(selectUser);

  useAuthSubscription();

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

  if (!user) {
    content = (
      <View>
        <Text>Please log in.</Text>
      </View>
    );
  }

  content = (
    <View>
      <Text>Welcome {user.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );

  return (
    <StyledSafeAreaView theme={{ isDarkMode }}>{content}</StyledSafeAreaView>
  );
}

export default App;
