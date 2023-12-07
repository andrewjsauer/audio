import React from 'react';
import styled from 'styled-components/native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const PhoneNumberInput = styled.TextInput`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  width: 80%;
`;

function EnterPhoneNumberScreen() {
  const { t } = useTranslation();

  const { goToNextStep } = useAuthFlow();

  return (
    <Container>
      <PhoneNumberInput placeholder={t('enterPhone')} />
      <Button title={t('getCode')} onPress={() => goToNextStep()} />
    </Container>
  );
}

export default EnterPhoneNumberScreen;
