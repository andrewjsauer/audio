import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import { PartnerDetailsSteps as Steps } from '@lib/types';

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

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  const relationshipType =
    partnerDetails?.relationshipType ?? ('' as RelationshipType);

  const types = t('auth.partnerDetails.relationshipTypeScreen.types', {
    returnObjects: true,
  }) as { [key in RelationshipType]: string }[];
  return (
    <Layout
      goBack={() => goToPreviousStep(Steps.NameStep)}
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
                onChange={(value) =>
                  handlePartnerDetails({ relationshipType: value })
                }
                checked={relationshipType === key}
                key={key}
                label={label}
                value={key}
              />
            );
          })}
        </RelationshipTypeContainer>
        <ButtonWrapper>
          <Button
            onPress={() => goToNextStep(Steps.RelationshipDateStep)}
            text={t('next')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default RelationshipTypeScreen;