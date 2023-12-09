import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';

import { PartnerDetailsSteps as Steps } from '@lib/types';
import { showNotification } from '@store/ui/slice';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';
import { TextInput } from './style';

function PartnerNameScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen('PartnerNameScreen');
  }, []);

  const { goToNextStep, partnerDetails, handlePartnerDetails } = useAuthFlow();
  const { name } = partnerDetails;

  const handleSubmit = () => {
    if (!name) {
      dispatch(
        showNotification({
          title: t('errors.pleaseTryAgain'),
          description: t('errors.partnerNameEmpty'),
          type: 'error',
        }),
      );

      trackEvent('partner_name_empty');
      return;
    }

    goToNextStep(Steps.RelationshipTypeStep);
  };

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
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PartnerNameScreen;
