import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PhoneInput from 'react-native-phone-number-input';

import { trackEvent, trackScreen } from '@lib/analytics';

import { resendCode, submitPhoneNumber, verifyCode } from '@store/auth/thunks';

import { showNotification } from '@store/ui/slice';
import { setConfirm, setCode } from '@store/auth/slice';

import {
  selectCode,
  selectConfirm,
  selectIsLoading,
  selectUser,
} from '@store/auth/selectors';

import { AppDispatch } from '@store/index';
import { useAuthFlow } from '@components/Auth/AuthFlowContext';

import PhoneNumberScreen from './PhoneNumberScreen';
import VerificationCodeScreen from './VerificationCodeScreen';

function PhoneNumberScreenContainer() {
  const dispatch = useDispatch<AppDispatch>();

  const phoneInputRef = useRef<PhoneInput>(null);
  const { goToNextStep, goToPreviousStep, handleUserDetails, userDetails } =
    useAuthFlow();

  const { phoneNumber = '' } = userDetails;

  const code = useSelector(selectCode);
  const isLoading = useSelector(selectIsLoading);
  const confirm = useSelector(selectConfirm);
  const user = useSelector(selectUser);

  useEffect(() => {
    trackScreen('PhoneNumberScreen');
  }, []);

  useEffect(() => {
    if (user) goToNextStep();
  }, [user]);

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

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) {
      showError('errors.phoneNumberEmpty', 'phone_number_empty');
      return;
    }

    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!isValid) {
      showError('errors.phoneNumberInvalid', 'phone_number_invalid');
      return;
    }

    trackEvent('phone_number_submit_pressed');
    dispatch(submitPhoneNumber(phoneNumber));
  };

  const onVerificationCodeSubmit = () => {
    if (!code) {
      showError('errors.verificationCodeEmpty', 'verification_code_empty');
      return;
    }

    dispatch(verifyCode({ confirm, code, phoneNumber }));
  };

  const handleResendCode = () => {
    if (isLoading) return;
    dispatch(resendCode(phoneNumber));
  };

  const handleGoBackButtonClick = () => {
    if (confirm) {
      dispatch(setConfirm(null));
      return;
    }

    goToPreviousStep();
  };

  return !confirm ? (
    <PhoneNumberScreen
      goToPreviousStep={handleGoBackButtonClick}
      isLoading={isLoading}
      onPhoneSubmit={handlePhoneSubmit}
      phoneInputRef={phoneInputRef}
      phoneNumber={phoneNumber}
      setPhoneNumber={(number: string) =>
        handleUserDetails({ phoneNumber: number })
      }
    />
  ) : (
    <VerificationCodeScreen
      code={code}
      goToPreviousStep={handleGoBackButtonClick}
      isLoading={isLoading}
      onResendCode={handleResendCode}
      onVerificationCodeSubmit={onVerificationCodeSubmit}
      setCode={(typedCode) => dispatch(setCode(typedCode))}
    />
  );
}

export default PhoneNumberScreenContainer;
