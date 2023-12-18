import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';

import { signOut } from '@store/app/thunks';

import { trackEvent } from '@lib/analytics';
import { AppScreens } from '@lib/types';

import SettingsIcon from '@assets/icons/settings.svg';
import Button from '@components/shared/Button';

import {
  QuestionContainer,
  Container,
  LogoutButton,
  HistoryButtonContainer,
} from './style';

function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const userId = useSelector(selectUserId);

  const handleLogout = () => {
    trackEvent('sign_out_button_clicked');
    dispatch(signOut(userId));
  };

  const handleNavigateToHistory = () => {
    trackEvent('view_history_button_clicked');
    navigation.navigate(AppScreens.HistoryScreen);
  };

  return (
    <Container style={{ paddingTop: Math.max(insets.top, 28) }}>
      <LogoutButton onPress={handleLogout}>
        <SettingsIcon width={24} height={24} />
      </LogoutButton>
      <QuestionContainer>{children}</QuestionContainer>
      <HistoryButtonContainer>
        <Button
          text="View History"
          size="small"
          onPress={handleNavigateToHistory}
        />
      </HistoryButtonContainer>
    </Container>
  );
}

export default Layout;
