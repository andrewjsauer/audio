import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@components/shared/Button';

import Logo from '../../assets/icons/logo.svg';
import {
  ButtonWrapper,
  Container,
  Title,
  SubtitleDescription,
  Subtitle,
} from './style';

function SignInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Container style={{ paddingTop: insets.top }}>
      <View>
        <Title>{t('auth.signInScreen.title')}</Title>
        <Subtitle>{t('auth.signInScreen.subtitle')}</Subtitle>
        <SubtitleDescription>
          {t('auth.signInScreen.description')}
        </SubtitleDescription>
      </View>
      <Logo width={110} height={80} />
      <ButtonWrapper>
        <Button mode="dark" text={t('auth.signIn')} />
      </ButtonWrapper>
    </Container>
  );
}

export default SignInScreen;
