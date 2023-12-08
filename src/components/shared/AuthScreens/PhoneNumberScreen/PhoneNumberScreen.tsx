import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PhoneNumberInput from 'react-native-phone-number-input';

import Button from '@components/shared/Button';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  phoneInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#909090',
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
  },
  textInput: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
  },
  textContainer: {
    backgroundColor: '#FFFFFF',
  },
});

type Props = {
  currentStep: number;
  goToPreviousStep: () => void;
  isLoading: boolean;
  onPhoneSubmit: () => void;
  phoneInputRef: React.RefObject<PhoneNumberInput>;
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
};

function PhoneNumberScreen({
  currentStep,
  goToPreviousStep,
  isLoading,
  onPhoneSubmit,
  phoneInputRef,
  phoneNumber,
  setPhoneNumber,
}: Props) {
  const { t } = useTranslation();

  return (
    <Layout
      step={currentStep}
      goBack={goToPreviousStep}
      title={t('auth.phoneNumberScreen.welcome')}>
      <Container>
        <InputWrapper>
          <InputTitle>{t('auth.signIn')} *</InputTitle>
          <PhoneNumberInput
            autoFocus
            codeTextStyle={styles.codeText}
            containerStyle={styles.phoneInput}
            defaultCode="US"
            layout="first"
            onChangeFormattedText={setPhoneNumber}
            ref={phoneInputRef}
            textContainerStyle={styles.textContainer}
            textInputStyle={styles.textInput}
            value={phoneNumber}
          />
          <InputSubtitle>
            {t('auth.phoneNumberScreen.disclaimer')}
          </InputSubtitle>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            isLoading={isLoading}
            text={t('auth.getCode')}
            onPress={onPhoneSubmit}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PhoneNumberScreen;
