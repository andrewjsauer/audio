import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';

import { PartnerDetailsSteps as Steps } from '@lib/types';
import { trackScreen } from '@lib/analytics';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';
import { StyledDatePicker } from './style';

function RelationshipDateScreen() {
  const { t } = useTranslation();

  useEffect(() => {
    trackScreen('RelationshipDateScreen');
  }, []);

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  const relationshipDate = partnerDetails.relationshipDate
    ? new Date(partnerDetails.relationshipDate)
    : new Date();

  return (
    <Layout
      goBack={() => goToPreviousStep(Steps.RelationshipTypeStep)}
      isBackButtonEnabled
      title={t('auth.partnerDetails.relationshipDateScreen.title')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.partnerDetails.relationshipDateScreen.inputTitle')}
          </InputTitle>
          <StyledDatePicker
            date={relationshipDate}
            onDateChange={(date) =>
              handlePartnerDetails({ relationshipDate: date })
            }
            mode="date"
          />
          <InputSubtitle>
            {t('auth.partnerDetails.relationshipDateScreen.inputDescription')}
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
