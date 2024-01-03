import React from 'react';
import { useTranslation } from 'react-i18next';

import { RelationshipType } from '@lib/types';

import { RadioButtonContainer, RadioCircle, RadioDot, Label } from './style';

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

function RelationshipTypePicker({
  onChange,
  value,
}: {
  onChange: (type: RelationshipType) => void;
  value: RelationshipType | string;
}) {
  const { t } = useTranslation();

  const types = t('auth.partnerDetails.relationshipTypeScreen.types', {
    returnObjects: true,
  }) as { [key in RelationshipType]: string }[];
  return (
    <>
      {types.map((type) => {
        const [key, label] = Object.entries(type)[0] as [RelationshipType, string];

        return (
          <RadioButton
            onChange={onChange}
            checked={value === key}
            key={key}
            label={label}
            value={key}
          />
        );
      })}
    </>
  );
}

export default RelationshipTypePicker;
