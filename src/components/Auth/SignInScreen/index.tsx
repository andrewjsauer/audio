import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import { trackEvent, trackIdentify } from '@lib/analytics';

import Button from '@components/shared/Button';
import Layout from '@components/Auth/Layout';

import { selectUser, selectCode, selectConfirm, selectUserData } from '@store/auth/selectors';
import { setUser, setCode, setConfirm, setUserData } from '@store/auth/slice';
import { AppDispatch } from '@store/index';

import { useAuthFlow } from '@components/Auth/AuthFlowContext';
import ButtonURL from '@components/shared/ButtonUrl';

import {
  ButtonWrapper,
  Container,
  FooterContainer,
  Header,
  LegalButtonContainer,
  LegalContainer,
  LegalText,
  Subtitle,
  SubtitleDescription,
  Title,
} from './style';

function SignInScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { goToNextStep } = useAuthFlow();

  const userData = useSelector(selectUserData);
  const user = useSelector(selectUser);
  const code = useSelector(selectCode);
  const confirm = useSelector(selectConfirm);

  useEffect(() => {
    trackEvent('Sign In Screen Seen');

    if (user) dispatch(setUser(null));
    if (code) dispatch(setCode(''));
    if (confirm) dispatch(setConfirm(null));
    if (userData) dispatch(setUserData(null));

    const anonymousId = uuidv4();
    trackIdentify(anonymousId);
  }, []);

  return (
    <Layout isHeaderEnabled={false}>
      <Container>
        <Header>
          <Title>{t('auth.signInScreen.title')}</Title>
          <Subtitle>{t('auth.signInScreen.subtitle')}</Subtitle>
          <SubtitleDescription>{t('auth.signInScreen.description')}</SubtitleDescription>
        </Header>
        <FooterContainer>
          <LegalContainer>
            <ButtonWrapper>
              <Button mode="dark" text={t('auth.signIn')} onPress={() => goToNextStep()} />
            </ButtonWrapper>
            <LegalText>{t('auth.signInScreen.terms')}</LegalText>
            <LegalButtonContainer>
              <ButtonURL url="https://docs.google.com/document/d/1vvfIdHnZnoNj_hTTqNFcRme5IsuN5DQC6WEHU4wAqA4/edit?usp=sharing">
                {t('accountScreen.privacy')}
              </ButtonURL>
              <LegalText>{t('accountScreen.and')}</LegalText>
              <ButtonURL url="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">
                {t('accountScreen.terms')}
              </ButtonURL>
            </LegalButtonContainer>
          </LegalContainer>
        </FooterContainer>
      </Container>
    </Layout>
  );
}

export default SignInScreen;
