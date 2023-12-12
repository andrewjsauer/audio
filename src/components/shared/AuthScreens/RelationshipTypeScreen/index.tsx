import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { showNotification } from '@store/ui/slice';

import Layout from '../Layout';
import { Container, ButtonWrapper } from '../style';
import {
  RelationshipTypeContainer,
  RadioButtonContainer,
  RadioCircle,
  RadioDot,
  Label,
} from './style';

type RelationshipType =
  | 'stillGettingToKnowEachOther'
  | 'dating'
  | 'inARelationship'
  | 'engaged'
  | 'domesticPartnership'
  | 'married'
  | 'cohabiting'
  | 'longDistanceRelationship'
  | 'consensualNonMonogamousRelationship'
  | 'inAnOpenRelationship';

type RadioButtonProps = {
  label: string;
  value: RelationshipType;
  checked: boolean;
  onChange: (value: RelationshipType) => void;
};

function RadioButton({ label, value, checked, onChange }: RadioButtonProps) {
  return (
    <RadioButtonContainer onPress={() => onChange(value)}>
      <RadioCircle checked={checked}>{checked && <RadioDot />}</RadioCircle>
      <Label>{label}</Label>
    </RadioButtonContainer>
  );
}

function RelationshipTypeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen('RelationshipTypeScreen');
  }, []);

  const {
    goToNextStep,
    goToPreviousStep,
    handlePartnershipDetails,
    partnershipDetails,
  } = useAuthFlow();

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

  const types = t('auth.partnerDetails.relationshipTypeScreen.types', {
    returnObjects: true,
  }) as { [key in RelationshipType]: string }[];
  return (
    <Layout
      goBack={goToPreviousStep}
      isBackButtonEnabled
      title={t('auth.partnerDetails.relationshipTypeScreen.title')}>
      <Container>
        <RelationshipTypeContainer>
          {types.map((type) => {
            const [key, label] = Object.entries(type)[0] as [
              RelationshipType,
              string,
            ];

            return (
              <RadioButton
                onChange={(value) => handlePartnershipDetails({ type: value })}
                checked={relationshipType === key}
                key={key}
                label={label}
                value={key}
              />
            );
          })}
        </RelationshipTypeContainer>
        <ButtonWrapper>
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipTypeScreen;
