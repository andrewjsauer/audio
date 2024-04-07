import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import i18n from 'i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import { trackEvent } from '@lib/analytics';
import { showNotification } from '@store/ui/slice';

import Layout from '../Layout';
import { Container, Title, ButtonWrapper, InputSubtitle, InputWrapper } from '../style';
import { Wrapper, StyledDatePicker, TitleContainer } from './style';

function RelationshipDateScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDate = new Date();

  const { goToNextStep, goToPreviousStep, handlePartnershipDetails, partnershipDetails } =
    useAuthFlow();

  const relationshipDate = partnershipDetails.startDate;

  const handleSubmit = () => {
    if (!relationshipDate) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.relationshipDateEmpty',
          type: 'error',
        }),
      );

      trackEvent('Relationship Start Date Submitted Error');
      return;
    }

    trackEvent('Relationship Start Date Submitted');
    goToNextStep();
  };

  return (
    <Layout goBack={goToPreviousStep} isBackArrowDisabled={false} isPartnershipComplete>
      <Container>
        <Wrapper>
          <TitleContainer>
            <Title>{t('auth.partnerDetails.relationshipDateScreen.title')}</Title>
          </TitleContainer>
          <InputWrapper>
            <StyledDatePicker
              date={relationshipDate || currentDate}
              maximumDate={currentDate}
              mode="date"
              onDateChange={(date) => handlePartnershipDetails({ startDate: date })}
              textColor="#000"
              locale={i18n.language}
            />
            <InputSubtitle>
              {t('auth.partnerDetails.relationshipDateScreen.inputDescription')}
            </InputSubtitle>
          </InputWrapper>
          <ButtonWrapper>
            <Button onPress={handleSubmit} text={t('next')} />
          </ButtonWrapper>
        </Wrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipDateScreen;
