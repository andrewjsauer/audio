import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

import Button from '@components/shared/Button';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';

import { CodeInput, ResendCodeWrapper, ResendCodeTextWrapper } from './style';

type Props = {
  code: string;
  goToPreviousStep: () => void;
  isLoading: boolean;
  onResendCode: () => void;
  onVerificationCodeSubmit: () => void;
  setCode: (text: string) => void;
};

function VerificationCodeScreen({
  code,
  goToPreviousStep,
  isLoading,
  onResendCode,
  onVerificationCodeSubmit,
  setCode,
}: Props) {
  const { t } = useTranslation();

  const [remainingTime, setRemainingTime] = useState(30);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((time) => (time > 0 ? time - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const resetTimer = () => {
    setRemainingTime(30);
  };

  const handleVerificationSubmit = () => {
    resetTimer();
    onVerificationCodeSubmit();
  };

  const handleResendCode = () => {
    if (remainingTime === 0) {
      resetTimer();
      onResendCode();
    }
  };

  return (
    <Layout
      goBack={goToPreviousStep}
      title={t('auth.verificationCodeScreen.title')}>
      <Container>
        <InputWrapper>
          <InputTitle>{t('auth.verificationCodeScreen.inputTitle')}</InputTitle>
          <CodeInput
            autoFocus
            placeholder="6-Digit Code"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            textContentType="oneTimeCode"
          />
          <ResendCodeWrapper>
            <InputSubtitle>
              {t('auth.verificationCodeScreen.inputDescriptionP1')}
            </InputSubtitle>
            <TouchableOpacity onPress={handleResendCode}>
              <ResendCodeTextWrapper>
                <InputSubtitle>
                  {t('auth.verificationCodeScreen.inputDescriptionP2')}
                </InputSubtitle>
              </ResendCodeTextWrapper>
            </TouchableOpacity>
            <InputSubtitle>
              {t('auth.verificationCodeScreen.inputDescriptionP3')}
              {remainingTime}
              {t('auth.verificationCodeScreen.inputDescriptionP4')}
            </InputSubtitle>
          </ResendCodeWrapper>
        </InputWrapper>
        <ButtonWrapper>
          <Button
            isLoading={isLoading}
            onPress={handleVerificationSubmit}
            text={t('auth.verificationCodeScreen.buttonText')}
          />
        </ButtonWrapper>
      </Container>
    </Layout>
  );
}

export default VerificationCodeScreen;
