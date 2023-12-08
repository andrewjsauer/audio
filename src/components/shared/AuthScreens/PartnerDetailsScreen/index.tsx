import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';
import { TextInput } from './style';

function PartnerDetailsScreen() {
  const { t } = useTranslation();

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  const { name } = partnerDetails;

  // Add handler for name validation
  return (
    <Layout
      goBack={goToPreviousStep}
      step={currentStep}
      title={t('auth.partnerDetailsScreen.partnersName')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.partnerDetailsScreen.partnersNameInputTitle')} *
          </InputTitle>
          <TextInput
            placeholder={t(
              'auth.partnerDetailsScreen.partnersNameInputPlaceholder',
            )}
            keyboardType="default"
            onChangeText={(typedName) =>
              handlePartnerDetails({ name: typedName })
            }
            autoCapitalize="words"
            returnKeyType="next"
          />
          <InputSubtitle>
            {t('auth.partnerDetailsScreen.partnersNameInputDescription')}
          </InputSubtitle>
        </InputWrapper>

        <ButtonWrapper>
          <Button onPress={() => {}} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PartnerDetailsScreen;
