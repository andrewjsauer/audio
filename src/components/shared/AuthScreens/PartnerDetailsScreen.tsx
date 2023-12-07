import React from 'react';
import styled from 'styled-components/native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Option = styled.TouchableOpacity`
  margin: 10px;
`;

const OptionText = styled.Text`
  font-size: 18px;
`;

function RelationshipStatusScreen() {
  const { t } = useTranslation();

  return (
    <Container>
      <Option onPress={() => {}}>
        <OptionText>{t('single')}</OptionText>
      </Option>
      <Button title={t('next')} onPress={() => {}} />
    </Container>
  );
}

export default RelationshipStatusScreen;
