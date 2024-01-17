import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { trackEvent, trackScreen } from '@lib/analytics';
import { showNotification } from '@store/ui/slice';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import ColorPicker from '@components/shared/ColorPicker';
import Layout from '../Layout';

import { Container, ButtonWrapper, InputSubtitle, InputWrapper } from '../style';
import { TextInput } from './style';

function PartnerNameScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    trackScreen('PartnerNameScreen');
  }, []);

  const { goToNextStep, partnerDetails, handlePartnerDetails } = useAuthFlow();
  const { name, color } = partnerDetails;

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

      trackEvent('partners_color_empty_error');
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

      trackEvent('partner_name_empty_error');
      return;
    }

    goToNextStep();
  };

  return (
    <Layout isBackButtonEnabled={false} title={t('auth.partnerDetails.nameScreen.title')}>
      <Container>
        <ColorPicker
          color={color}
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
