import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux';

import { selectPartnerData } from '@store/partnership/selectors';
import { selectUserData } from '@store/auth/selectors';
import { signOut } from '@store/app/thunks';

import { AppDispatch } from '@store/index';

import { trackEvent, trackScreen } from '@lib/analytics';

import ChevronRight from '@assets/icons/chevron-right.svg';

import Layout from '@components/shared/Layout';
import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';
import ButtonURL from '@components/shared/ButtonURL';

import {
  Container,
  DeleteAccountButton,
  DeleteAccountText,
  Footer,
  OptionButton,
  OptionColor,
  OptionContainer,
  OptionName,
  OptionTitle,
  SignOutButton,
  SignOutText,
  LegalContainer,
  LegalText,
  LegalButtonContainer,
} from './style';

function AccountScreenContainer() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);

  useEffect(() => {
    trackScreen('AccountScreen');
  }, []);

  const handleLogout = () => {
    trackEvent('sign_out_button_clicked');
    dispatch(signOut(userData?.id));
  };

  return (
    <Layout titleKey="accountScreen.title" screen="account_screen">
      <Container>
        <OptionContainer>
          <OptionTitle>{t('accountScreen.yourName')}</OptionTitle>
          <OptionButton>
            <OptionName>{userData?.name}</OptionName>
            <ChevronRight width={24} height={24} />
          </OptionButton>
        </OptionContainer>
        <OptionContainer>
          <OptionTitle>{t('accountScreen.yourColor')}</OptionTitle>
          <OptionButton>
            <OptionColor color={userData?.color} />
            <ChevronRight width={24} height={24} />
          </OptionButton>
        </OptionContainer>
        <OptionContainer>
          <OptionTitle>{t('accountScreen.yourPartnerName')}</OptionTitle>
          <OptionName>{partnerData?.name}</OptionName>
        </OptionContainer>
        <OptionContainer>
          <OptionTitle>{t('accountScreen.yourPartnerColor')}</OptionTitle>
          <OptionColor color={partnerData?.color} />
        </OptionContainer>
      </Container>
      <Footer>
        <DeleteAccountButton>
          <DeleteAccountText>
            {t('accountScreen.deleteAccount')}
          </DeleteAccountText>
        </DeleteAccountButton>
        <SignOutButton onPress={handleLogout}>
          <SignOutText>{t('accountScreen.signOut')}</SignOutText>
        </SignOutButton>
        <LegalContainer>
          <LegalText>{t('accountScreen.legal')}</LegalText>
          <LegalButtonContainer>
            <ButtonURL url="https://www.google.com">
              {t('accountScreen.privacyPolicy')}
            </ButtonURL>
            <LegalText>{t('accountScreen.and')}</LegalText>
            <ButtonURL url="https://www.google.com">
              {t('accountScreen.termsOfService')}
            </ButtonURL>
          </LegalButtonContainer>
        </LegalContainer>
      </Footer>
    </Layout>
  );
}

export default AccountScreenContainer;
