import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import Layout from '@components/Auth/Layout';
import Logo from '@assets/icons/logo.svg';

import { useAuthFlow } from '@components/Auth/AuthFlowContext';
import ButtonURL from '@components/shared/ButtonUrl';

import {
  LegalContainer,
  LegalText,
  LegalButtonContainer,
  ButtonWrapper,
  Container,
  Title,
  SubtitleDescription,
  Subtitle,
} from './style';

function SignInScreen() {
  const { t } = useTranslation();
  const { goToNextStep } = useAuthFlow();

  useEffect(() => {
    trackScreen('SignInScreen');
  }, []);

  return (
    <Layout isHeaderEnabled={false}>
      <Container>
        <View>
          <Title>{t('auth.signInScreen.title')}</Title>
          <Subtitle>{t('auth.signInScreen.subtitle')}</Subtitle>
          <SubtitleDescription>{t('auth.signInScreen.description')}</SubtitleDescription>
        </View>
        <Logo width={110} height={80} />
        <ButtonWrapper>
          <Button mode="dark" text={t('auth.signIn')} onPress={goToNextStep} />
        </ButtonWrapper>
      </Container>
      <LegalContainer>
        <LegalText>{t('auth.signInScreen.terms')}</LegalText>
        <LegalButtonContainer>
          <ButtonURL url="https://docs.google.com/document/d/1vvfIdHnZnoNj_hTTqNFcRme5IsuN5DQC6WEHU4wAqA4/edit?usp=sharing">
            {t('accountScreen.privacy')}
          </ButtonURL>
          <LegalText>{t('accountScreen.and')}</LegalText>
          <ButtonURL url="https://docs.google.com/document/d/1KursDxKfe8pzyC4RI-lldCLcxxPLOkmwLrxIEnL_Kbw/edit?usp=sharing">
            {t('accountScreen.terms')}
          </ButtonURL>
        </LegalButtonContainer>
      </LegalContainer>
    </Layout>
  );
}

export default SignInScreen;
