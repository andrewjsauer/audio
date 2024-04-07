import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import i18n from 'i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import { showNotification } from '@store/ui/slice';
import { selectIsLoading } from '@store/auth/selectors';

import { trackEvent } from '@lib/analytics';

import Layout from '../Layout';
import { Container, ButtonWrapper, InputTitle, InputSubtitle, InputWrapper, Title } from '../style';

import { StyledDatePicker, TitleContainer, Wrapper } from './style';

function BirthdayScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDate = new Date();

  const isLoading = useSelector(selectIsLoading);

  const { goToPreviousStep, goToNextStep, userDetails, handleUserDetails } = useAuthFlow();

  const birthday = userDetails.birthDate;

  const handleSubmit = async () => {
    if (!birthday) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.birthdayEmpty',
          type: 'error',
        }),
      );

      trackEvent('Birthday Submitted User Error');

      return;
    }

    trackEvent('Birthday Submitted');
    goToNextStep();
  };

  return (
    <Layout goBack={goToPreviousStep} isBackArrowDisabled={false}>
      <Container>
        <Wrapper>
          <TitleContainer>
            <Title>{t('auth.userDetails.birthdayScreen.title')}</Title>
          </TitleContainer>
          <InputWrapper>
            <StyledDatePicker
              date={birthday || currentDate}
              maximumDate={currentDate}
              mode="date"
              onDateChange={(date) => handleUserDetails({ birthDate: date })}
              textColor="#000"
              locale={i18n.language}
            />
            <InputSubtitle>{t('auth.userDetails.birthdayScreen.inputDescription')}</InputSubtitle>
          </InputWrapper>
          <ButtonWrapper>
            <Button isLoading={isLoading} onPress={handleSubmit} text={t('next')} />
          </ButtonWrapper>
        </Wrapper>
      </Container>
    </Layout>
  );
}

export default BirthdayScreen;
