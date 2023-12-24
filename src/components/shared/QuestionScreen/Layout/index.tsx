import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { trackEvent } from '@lib/analytics';
import { AppScreens } from '@lib/types';

import SettingsIcon from '@assets/icons/settings.svg';
import Button from '@components/shared/Button';

import { Container, SettingsButton, HistoryButtonContainer } from './style';

function Layout({
  children,
  isLoading = false,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleNavigateToSettings = () => {
    trackEvent('settings_button_clicked');
    navigation.navigate(AppScreens.AccountScreen);
  };

  const handleNavigateToHistory = () => {
    trackEvent('view_history_button_clicked');
    navigation.navigate(AppScreens.HistoryScreen);
  };

  return (
    <Container style={{ paddingTop: Math.max(insets.top, 28) }}>
      <SettingsButton onPress={handleNavigateToSettings}>
        <SettingsIcon width={24} height={24} />
      </SettingsButton>
      {children}
      <HistoryButtonContainer>
        <Button
          text="View History"
          size="small"
          mode="hidden"
          isLoading={isLoading}
          onPress={handleNavigateToHistory}
        />
      </HistoryButtonContainer>
    </Container>
  );
}

export default Layout;
