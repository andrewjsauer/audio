import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { trackEvent } from '@lib/analytics';

import ChevronLeft from '@assets/icons/chevron-left.svg';

import { Container, BackButton, Header, Title } from './style';

function Layout({
  children,
  titleKey,
  screen,
}: {
  children: React.ReactNode;
  titleKey: string;
  screen: string;
}) {
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleGoBack = () => {
    trackEvent(`${screen}_back_clicked`);
    navigation.goBack();
  };

  return (
    <Container style={{ paddingTop: Math.max(insets.top, 28) }}>
      <Header>
        <BackButton onPress={handleGoBack}>
          <ChevronLeft width={30} height={30} />
        </BackButton>
        <Title>{t(titleKey)}</Title>
      </Header>
      {children}
    </Container>
  );
}

export default Layout;
