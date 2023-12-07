import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import PhoneNumberInput from 'react-native-phone-number-input';
import { useDispatch } from 'react-redux';

import { trackEvent } from '@lib/analytics';

import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import Button from '@components/shared/Button';
import { showNotification } from '@store/ui/slice';

import Layout from '../Layout';
import {
  Container,
  PhoneWrapper,
  PhoneSubtitle,
  PhoneTitle,
  ButtonWrapper,
} from './style';

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  phoneInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
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
    borderBottomWidth: 0,
  },
});

function PhoneNumberScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { currentStep, goToNextStep, goToPreviousStep } = useAuthFlow();
  const [phoneNumber, setPhoneNumber] = useState('');

  // const signInWithPhoneNumber = async (number) => {
  //   setIsLoading(true);

  //   const confirmation = await auth().signInWithPhoneNumber(number);

  //   trackEvent('phone_number_submitted', {
  //     number,
  //   });

  //   setIsLoading(false);
  //   onConfirm(confirmation);
  // };
  dispatch(
    showNotification({
      title: 'Know when Linda answers...',
      description: 'Allow notifications for questions and answers',
      type: 'success',
    }),
  );

  return (
    <Layout
      step={currentStep}
      goBack={goToPreviousStep}
      title={t('auth.phoneNumberScreen.welcome')}>
      <Container>
        <PhoneWrapper>
          <PhoneTitle>{t('auth.signIn')} *</PhoneTitle>
          <PhoneNumberInput
            autoFocus
            defaultCode="US"
            layout="first"
            onChangeFormattedText={setPhoneNumber}
            value={phoneNumber}
            containerStyle={styles.phoneInput}
            textInputStyle={styles.textInput}
            codeTextStyle={styles.codeText}
            textContainerStyle={styles.textContainer}
          />
          <PhoneSubtitle>
            {t('auth.phoneNumberScreen.disclaimer')}
          </PhoneSubtitle>
        </PhoneWrapper>
        <ButtonWrapper>
          <Button text={t('auth.getCode')} onPress={() => goToNextStep()} />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default PhoneNumberScreen;
