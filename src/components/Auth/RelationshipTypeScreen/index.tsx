import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';
import { RelationshipType } from '@lib/types';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import { showNotification } from '@store/ui/slice';

import RelationshipTypePicker from '@components/shared/RelationshipTypePicker';

import Layout from '../Layout';
import { Container, ButtonWrapper } from '../style';
import { RelationshipPickerContainer } from './style';

function RelationshipTypeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen('RelationshipTypeScreen');
  }, []);

  const { goToNextStep, goToPreviousStep, handlePartnershipDetails, partnershipDetails } =
    useAuthFlow();

  const relationshipType = partnershipDetails?.type ?? ('' as RelationshipType);

  const handleSubmit = () => {
    if (!relationshipType) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.relationshipTypeEmpty',
          type: 'error',
        }),
      );

      trackEvent('relationship_type_empty_error');
      return;
    }

    goToNextStep();
  };

  return (
    <Layout
      goBack={goToPreviousStep}
      isBackButtonEnabled
      title={t('auth.partnerDetails.relationshipTypeScreen.title')}
    >
      <Container>
        <RelationshipPickerContainer>
          <RelationshipTypePicker
            onChange={(type) => handlePartnershipDetails({ type })}
            value={relationshipType}
          />
        </RelationshipPickerContainer>
        <ButtonWrapper>
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipTypeScreen;