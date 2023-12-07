import React from 'react';
import styled from 'styled-components/native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NameInput = styled.TextInput`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  width: 80%;
`;

function UserDetailsScreen() {
  const { t } = useTranslation();

  return (
    <Container>
      <NameInput placeholder={t('enterName')} />
      <Button title={t('next')} onPress={() => {}} />
    </Container>
  );
}

export default UserDetailsScreen;
