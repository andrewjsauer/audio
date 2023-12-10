import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { showNotification } from '@store/ui/slice';
import { selectUser, selectPartnersData } from '@store/app/selectors';
import { setUserData } from '@store/app/slice';

import { UserDetailsSteps as Steps } from '@lib/types';
import { trackScreen, trackEvent } from '@lib/analytics';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';
import { StyledDatePicker } from './style';

function BirthdayScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const partnersData = useSelector(selectPartnersData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackScreen('BirthdayScreen');
  }, []);

  const { goToPreviousStep, userDetails, handleUserDetails } = useAuthFlow();

  const birthday = userDetails.birthDate
    ? new Date(userDetails.birthDate)
    : new Date();

  const showError = (errorKey: string, trackingKey: string) => {
    dispatch(
      showNotification({
        title: t('errors.pleaseTryAgain'),
        description: t(errorKey),
        type: 'error',
      }),
    );

    trackEvent(trackingKey);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!birthday) {
      dispatch(
        showNotification({
          title: t('errors.pleaseTryAgain'),
          description: t('errors.birthdayEmpty'),
          type: 'error',
        }),
      );

      trackEvent('birthday_empty');
      setIsLoading(false);
      return;
    }

    try {
      const batch = firestore().batch();
      const userDetailsData = {
        ...userDetails,
        partnerId: partnersData.id,
      };

      const userRef = firestore().collection('users').doc(user.uid);
      batch.set(userRef, userDetailsData, { merge: true });

      const partnerData = {
        ...(partnersData.partner1Id === user.uid && {
          partner1Name: userDetails.name,
        }),
        ...(partnersData.partner1Id === user.uid && {
          partnerPhoneNumbers: firestore.FieldValue.arrayUnion(
            userDetails.phoneNumber,
          ),
        }),
        ...(partnersData.partner1Id !== user.uid && { partner2Id: user.uid }),
      };

      const partnerRef = firestore()
        .collection('partners')
        .doc(partnersData.id);
      batch.set(partnerRef, partnerData, { merge: true });

      await batch.commit();

      dispatch(setUserData(userDetailsData));
      setIsLoading(false);
    } catch (error) {
      showError('errors.invitePartnerAPIError', 'invite_partner_api_error');
      crashlytics().recordError(error);
    }
  };

  return (
    <Layout
      goBack={() => goToPreviousStep(Steps.UserNameStep)}
      isBackButtonEnabled
      title={t('auth.userDetails.birthdayScreen.title')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.userDetails.birthdayScreen.inputTitle')}
          </InputTitle>
          <StyledDatePicker
            date={birthday}
            onDateChange={(date) => handleUserDetails({ birthDate: date })}
            mode="date"
          />
          <InputSubtitle>
            {t('auth.userDetails.birthdayScreen.inputDescription')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            isLoading={isLoading}
            onPress={handleSubmit}
            text={t('submit')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default BirthdayScreen;
