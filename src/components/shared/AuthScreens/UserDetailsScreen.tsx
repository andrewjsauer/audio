import React from 'react';
import styled from 'styled-components/native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import Layout from './Layout';

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

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
  } = useAuthFlow();

  return (
    <Layout goBack={goToPreviousStep} isBackButtonEnabled title="TEST">
      <Container>
        <NameInput placeholder={t('enterName')} />
        <Button title={t('next')} onPress={() => {}} />
      </Container>
    </Layout>
  );
}

export default UserDetailsScreen;
