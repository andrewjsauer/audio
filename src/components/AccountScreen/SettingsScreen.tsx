import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import moment from 'moment-timezone';
import i18n from 'i18next';

import { deleteRelationship } from '@store/auth/thunks';
import {
  selectPartnerData,
  selectPartnershipData,
  selectPartnershipTimeZone,
} from '@store/partnership/selectors';
import { selectUserData, selectIsLoading } from '@store/auth/selectors';
import { signOut } from '@store/app/thunks';

import { AppDispatch } from '@store/index';

import { trackEvent } from '@lib/analytics';
import { AccountScreens, RelationshipType } from '@lib/types';

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
  const partnershipData = useSelector(selectPartnershipData);
  const isLoading = useSelector(selectIsLoading);
  const timeZone = useSelector(selectPartnershipTimeZone);

  useEffect(() => {
    trackEvent('Settings Screen Seen');
  }, []);

  const handleLogout = () => {
    trackEvent('Sign Out Button Tapped');
    dispatch(
      signOut({
        userId: userData?.id,
        isDelete: false,
      }),
    );
  };

  const handleNameChange = () => {
    trackEvent('Account Name Button Tapped');
    navigation.navigate(AccountScreens.NameScreen);
  };

  const handleColorChange = () => {
    trackEvent('Account Color Button Tapped');
    navigation.navigate(AccountScreens.ColorScreen);
  };

  const handleLanguageChange = () => {
    trackEvent('Account Language Button Tapped');
    navigation.navigate(AccountScreens.LanguageScreen);
  };

  const handleRelationshipTypeChange = () => {
    trackEvent('Account Relationship Type Button Tapped');
    navigation.navigate(AccountScreens.RelationshipTypeScreen);
  };

  const handleTimeZoneTypeChange = () => {
    trackEvent('Account Time Zone Button Tapped');
    navigation.navigate(AccountScreens.TimeZoneScreen);
  };

  const handleDeleteAccount = () => {
    trackEvent('Delete Button Tapped');

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
            trackEvent('Confirm Account Deleted Tapped');
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

  const types = t('auth.partnerDetails.relationshipTypeScreen.types', {
    returnObjects: true,
  }) as { [key in RelationshipType]: string }[];

  const truncateString = (str, num) => {
    if (str.length <= num) {
      return str;
    }
    return `${str.slice(0, num)}...`;
  };

  const relationshipType = useMemo(() => {
    return types.reduce((acc, currentType) => {
      const typeKey = Object.keys(currentType)[0];
      if (typeKey === partnershipData?.type) {
        return truncateString(currentType[typeKey as keyof typeof currentType], 10);
      }
      return acc;
    }, '');
  }, [types, partnershipData]);

  return (
    <Layout titleKey="accountScreen.title" screen="Settings Screen">
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
              <OptionTitle>{t('accountScreen.relationshipStatus')}</OptionTitle>
              <OptionButton onPress={handleRelationshipTypeChange}>
                <OptionName>{relationshipType}</OptionName>
                <ChevronRight width={24} height={24} />
              </OptionButton>
            </OptionContainer>
            <OptionContainer>
              <OptionTitle>{t('accountScreen.relationshipTimeZone')}</OptionTitle>
              <OptionButton onPress={handleTimeZoneTypeChange}>
                <OptionName>{moment.tz(timeZone).zoneAbbr()}</OptionName>
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
              <ButtonURL url="https://forms.gle/Ah9nKKj8RN7AAu1G7">
                {t('accountScreen.request.title')}
              </ButtonURL>
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
