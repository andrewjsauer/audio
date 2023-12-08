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

function InviteScreen() {
  const { t } = useTranslation();

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  const { phoneNumber } = partnerDetails;

  return (
    <Layout
      goBack={goToPreviousStep}
      isBackButtonEnabled
      title={t('auth.inviteScreen.partnersName')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.inviteScreen.partnersNameInputTitle')} *
          </InputTitle>
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

export default InviteScreen;
