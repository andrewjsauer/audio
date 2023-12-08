import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import { PartnerDetailsSteps as Steps } from '@lib/types';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';
import { TextInput } from './style';

function NameScreen() {
  const { t } = useTranslation();

  const { goToNextStep, partnerDetails, handlePartnerDetails } = useAuthFlow();
  const { name } = partnerDetails;

  return (
    <Layout
      isBackButtonEnabled={false}
      title={t('auth.partnerDetails.nameScreen.title')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.partnerDetails.nameScreen.inputTitle')} *
          </InputTitle>
          <TextInput
            placeholder={t('auth.partnerDetails.nameScreen.inputPlaceholder')}
            keyboardType="default"
            onChangeText={(typedName) =>
              handlePartnerDetails({ name: typedName })
            }
            autoCapitalize="words"
            returnKeyType="next"
            value={name}
          />
          <InputSubtitle>
            {t('auth.partnerDetails.nameScreen.inputDescription')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            onPress={() => goToNextStep(Steps.RelationshipTypeStep)}
            text={t('next')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default NameScreen;
