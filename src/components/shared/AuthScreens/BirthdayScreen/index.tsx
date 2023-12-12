import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { showNotification } from '@store/ui/slice';
import { selectIsLoading } from '@store/auth/selectors';

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

  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    trackScreen('BirthdayScreen');
  }, []);

  const { goToPreviousStep, goToNextStep, userDetails, handleUserDetails } =
    useAuthFlow();

  const birthday = userDetails.birthDate
    ? new Date(userDetails.birthDate)
    : new Date();

  const handleSubmit = async () => {
    if (!birthday) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.birthdayEmpty',
          type: 'error',
        }),
      );

      trackEvent('birthday_empty_error');

      return;
    }

    goToNextStep();
  };

  return (
    <Layout
      goBack={goToPreviousStep}
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
            text={t('next')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default BirthdayScreen;
