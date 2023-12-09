import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { PartnerDetailsSteps as Steps } from '@lib/types';
import { trackScreen, trackEvent } from '@lib/analytics';
import { showNotification } from '@store/ui/slice';

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
  const dispatch = useDispatch();

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

  const handleSubmit = () => {
    if (!relationshipDate) {
      dispatch(
        showNotification({
          title: t('errors.pleaseTryAgain'),
          description: t('errors.relationshipDateEmpty'),
          type: 'error',
        }),
      );

      trackEvent('relationship_date_empty');
      return;
    }

    goToNextStep(Steps.InviteStep);
  };

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
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipDateScreen;
