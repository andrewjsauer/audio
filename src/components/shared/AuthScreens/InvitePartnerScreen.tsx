import React from 'react';
import styled from 'styled-components/native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const InviteInput = styled.TextInput`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  width: 80%;
`;

function InvitePartnerScreen() {
  const { t } = useTranslation();

  return (
    <Container>
      <InviteInput placeholder={t('partnerPhone')} />
      <Button title={t('sendInvite')} onPress={() => {}} />
    </Container>
  );
}

export default InvitePartnerScreen;
