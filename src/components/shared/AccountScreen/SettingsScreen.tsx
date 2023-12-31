import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';

import { deleteRelationship } from '@store/auth/thunks';
import { selectPartnerData } from '@store/partnership/selectors';
import { selectUserData, selectIsLoading } from '@store/auth/selectors';
import { signOut } from '@store/app/thunks';
import i18n from 'i18next';

import { AppDispatch } from '@store/index';

import { trackEvent, trackScreen } from '@lib/analytics';
import { AccountScreens } from '@lib/types';

import ChevronRight from '@assets/icons/chevron-right.svg';

import LoadingView from '@components/shared/LoadingView';
import Layout from '@components/shared/Layout';
import ButtonURL from '@components/shared/ButtonUrl';

import { languageMap } from './LanguageScreen';
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

function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    trackScreen('AccountScreen');
  }, []);

  const handleLogout = () => {
    trackEvent('sign_out_button_clicked');
    dispatch(
      signOut({
        userId: userData?.id,
        isDelete: false,
      }),
    );
  };

  const handleNameChange = () => {
    trackEvent('name_change_button_clicked');
    navigation.navigate(AccountScreens.NameScreen);
  };

  const handleColorChange = () => {
    trackEvent('color_change_button_clicked');
    navigation.navigate(AccountScreens.ColorScreen);
  };

  const handleLanguageChange = () => {
    trackEvent('language_change_button_clicked');
    navigation.navigate(AccountScreens.LanguageScreen);
  };

  const handleDeleteAccount = () => {
    trackEvent('delete_account_button_clicked');

    Alert.alert(
      t('accountScreen.deleteAccountModal.title'),
      t('accountScreen.deleteAccountModal.description'),
      [
        {
          text: t('accountScreen.deleteAccountModal.cancel'),
          style: 'cancel',
        },
        {
          text: t('accountScreen.deleteAccountModal.delete'),
          onPress: () => {
            dispatch(
              deleteRelationship({
                userId: userData?.id,
                partnerId: partnerData?.id,
                partnershipId: userData?.partnershipId,
              }),
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <Layout titleKey="accountScreen.title" screen="account_screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <Container>
            <OptionContainer>
              <OptionTitle>{t('accountScreen.language')}</OptionTitle>
              <OptionButton onPress={handleLanguageChange}>
                <OptionName>{languageMap[i18n.language]}</OptionName>
                <ChevronRight width={24} height={24} />
              </OptionButton>
            </OptionContainer>
            <OptionContainer>
              <OptionTitle>{t('accountScreen.yourName')}</OptionTitle>
              <OptionButton onPress={handleNameChange}>
                <OptionName>{userData?.name}</OptionName>
                <ChevronRight width={24} height={24} />
              </OptionButton>
            </OptionContainer>
            <OptionContainer>
              <OptionTitle>{t('accountScreen.yourColor')}</OptionTitle>
              <OptionButton onPress={handleColorChange}>
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
            <DeleteAccountButton onPress={handleDeleteAccount}>
              <DeleteAccountText>{t('accountScreen.deleteAccount')}</DeleteAccountText>
            </DeleteAccountButton>
            <SignOutButton onPress={handleLogout}>
              <SignOutText>{t('accountScreen.signOut')}</SignOutText>
            </SignOutButton>
            <LegalContainer>
              <LegalText>{t('accountScreen.legal')}</LegalText>
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
          </Footer>
        </>
      )}
    </Layout>
  );
}

export default SettingsScreen;
