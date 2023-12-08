import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import { PartnerDetailsSteps as Steps } from '@lib/types';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';

function RelationshipDateScreen() {
  const { t } = useTranslation();

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  const { relationshipDate } = partnerDetails;

  return (
    <Layout
      goBack={() => goToPreviousStep(Steps.RelationshipTypeStep)}
      isBackButtonEnabled
      title={t('auth.relationshipDateScreen.partnersName')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.relationshipDateScreen.partnersNameInputTitle')} *
          </InputTitle>
          <InputSubtitle>
            {t('auth.partnerDetailsScreen.partnersNameInputDescription')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            onPress={() => goToNextStep(Steps.InviteStep)}
            text={t('next')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipDateScreen;
