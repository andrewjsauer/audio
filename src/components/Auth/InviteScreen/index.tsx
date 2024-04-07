import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PhoneInputProp from 'react-native-phone-number-input';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';
import PhoneNumberInput from '@components/shared/PhoneNumberInput';

import { showNotification } from '@store/ui/slice';
import { selectIsLoading } from '@store/auth/selectors';

import { trackEvent } from '@lib/analytics';

import Layout from '../Layout';
import { TitleContainer, Wrapper } from './style';
import { Container, ButtonWrapper, InputTitle, InputSubtitle, InputWrapper, Title } from '../style';

function InviteScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const phoneInputRef = useRef<PhoneInputProp>(null);
  const isLoading = useSelector(selectIsLoading);

  const { goToNextStep, goToPreviousStep, partnerDetails, handlePartnerDetails } = useAuthFlow();

  const { phoneNumber = '' } = partnerDetails;

  const showError = (errorKey: string, trackingKey: string) => {
    dispatch(
      showNotification({
        title: 'errors.pleaseTryAgain',
        description: errorKey,
        type: 'error',
      }),
    );

    trackEvent(trackingKey);
  };

  const handleSendInvite = async () => {
    if (!phoneNumber) {
      showError('errors.phoneNumberEmpty', 'phone_number_empty_error');
      return;
    }

    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!isValid) {
      showError('errors.phoneNumberInvalid', 'phone_number_invalid_error');
      return;
    }

    trackEvent('Phone Number of Partner Submitted');
    goToNextStep();
  };

  return (
    <Layout goBack={goToPreviousStep} isBackArrowDisabled={false} isPartnershipComplete>
      <Container>
        <TitleContainer>
          <Title>{t('auth.partnerDetails.invitePartnerScreen.title')}</Title>
        </TitleContainer>
        <InputWrapper>
          <InputTitle>{t('auth.partnerDetails.invitePartnerScreen.inputTitle')}</InputTitle>
          <PhoneNumberInput
            setPhoneNumber={(number) => handlePartnerDetails({ phoneNumber: number })}
            phoneInputRef={phoneInputRef}
            phoneNumber={phoneNumber}
          />
          <InputSubtitle>
            {t('auth.partnerDetails.invitePartnerScreen.inputDescription')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            onPress={handleSendInvite}
            text={t('auth.partnerDetails.invitePartnerScreen.sendInvite')}
            isLoading={isLoading}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default InviteScreen;
