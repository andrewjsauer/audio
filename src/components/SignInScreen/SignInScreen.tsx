import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import Layout from '@components/shared/AuthScreens/Layout';
import Logo from '@assets/icons/logo.svg';

import { useAuthFlow } from './AuthFlowContext';
import {
  ButtonWrapper,
  Container,
  Title,
  SubtitleDescription,
  Subtitle,
} from './style';

function SignInScreen() {
  const { t } = useTranslation();
  const { goToNextStep, currentStep } = useAuthFlow();

  useEffect(() => {
    trackScreen('SignInScreen');
  }, []);

  return (
    <Layout step={currentStep}>
      <Container>
        <View>
          <Title>{t('auth.signInScreen.title')}</Title>
          <Subtitle>{t('auth.signInScreen.subtitle')}</Subtitle>
          <SubtitleDescription>
            {t('auth.signInScreen.description')}
          </SubtitleDescription>
        </View>
        <Logo width={110} height={80} />
        <ButtonWrapper>
          <Button mode="dark" text={t('auth.signIn')} onPress={goToNextStep} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default SignInScreen;
