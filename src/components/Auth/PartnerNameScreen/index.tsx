import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent } from '@lib/analytics';
import { showNotification } from '@store/ui/slice';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import ColorPicker from '@components/shared/ColorPicker';
import Layout from '../Layout';

import { Container, Title, ButtonWrapper, InputSubtitle, InputWrapper } from '../style';
import { TextInput, TitleContainer } from './style';

function PartnerNameScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { goToPreviousStep, goToNextStep, partnerDetails, userDetails, handlePartnerDetails } =
    useAuthFlow();
  const { name, color } = partnerDetails;
  const { color: colorOffLimits } = userDetails;

  const handleNameChange = (typedName: string) => {
    handlePartnerDetails({ name: typedName });
  };

  const handleSubmit = () => {
    if (!color) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.colorEmpty',
          type: 'error',
        }),
      );

      trackEvent('Partner Color Submitted User Error');
      return;
    }

    if (!name) {
      dispatch(
        showNotification({
          title: 'errors.pleaseTryAgain',
          description: 'errors.partnerNameEmpty',
          type: 'error',
        }),
      );

      trackEvent('Partner Name Submitted Error');
      return;
    }

    trackEvent('Partner Name and Color Submitted');
    goToNextStep();
  };

  return (
    <Layout goBack={goToPreviousStep} isBackArrowDisabled={false}>
      <Container>
        <TitleContainer>
          <Title>{t('auth.partnerDetails.nameScreen.title')}</Title>
        </TitleContainer>
        <ColorPicker
          color={color}
          colorOffLimits={colorOffLimits}
          onChange={(colorOption) => handlePartnerDetails({ color: colorOption })}
        />
        <InputWrapper>
          <TextInput
            placeholder={t('auth.partnerDetails.nameScreen.inputPlaceholder')}
            keyboardType="default"
            onChangeText={handleNameChange}
            autoCapitalize="words"
            returnKeyType="next"
            value={name}
            autoFocus
            placeholderTextColor="#909090"
          />
          <InputSubtitle>{t('auth.partnerDetails.nameScreen.inputDescription')}</InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button onPress={handleSubmit} text={t('next')} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PartnerNameScreen;
