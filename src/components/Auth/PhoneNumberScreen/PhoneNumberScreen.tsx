import React from 'react';
import { useTranslation } from 'react-i18next';
import PhoneNumberInputProp from 'react-native-phone-number-input';

import Button from '@components/shared/Button';
import PhoneNumberInput from '@components/shared/PhoneNumberInput';

import Layout from '../Layout';
import { Container, ButtonWrapper, InputTitle, InputSubtitle, InputWrapper, Title } from '../style';

type Props = {
  goToPreviousStep: () => void;
  isLoading: boolean;
  onPhoneSubmit: () => void;
  phoneInputRef: React.RefObject<PhoneNumberInputProp>;
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
};

function PhoneNumberScreen({
  goToPreviousStep,
  isLoading,
  onPhoneSubmit,
  phoneInputRef,
  phoneNumber,
  setPhoneNumber,
}: Props) {
  const { t } = useTranslation();

  return (
    <Layout goBack={goToPreviousStep}>
      <Container>
        <Title>{t('auth.phoneNumberScreen.title')}</Title>
        <InputWrapper>
          <InputTitle>{t('auth.phoneNumberScreen.inputTitle')}</InputTitle>
          <PhoneNumberInput
            setPhoneNumber={setPhoneNumber}
            phoneInputRef={phoneInputRef}
            phoneNumber={phoneNumber}
          />
          <InputSubtitle>{t('auth.phoneNumberScreen.inputDescription')}</InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            isLoading={isLoading}
            text={t('auth.signInScreen.buttonText')}
            onPress={onPhoneSubmit}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PhoneNumberScreen;
