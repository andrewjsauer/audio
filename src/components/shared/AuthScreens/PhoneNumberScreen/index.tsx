import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import PhoneInput from 'react-native-phone-number-input';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';

import { trackEvent, trackScreen } from '@lib/analytics';
import { SignInFlowStepTypes as Steps } from '@lib/types';

import { showNotification } from '@store/ui/slice';
import { setUser, setUserData, setPartnersData } from '@store/app/slice';

import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';

import PhoneNumberScreen from './PhoneNumberScreen';
import VerificationCodeScreen from './VerificationCodeScreen';

function PhoneNumberScreenContainer() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const phoneInputRef = useRef<PhoneInput>(null);
  const { currentStep, goToNextStep, goToPreviousStep, handleUserDetails } =
    useAuthFlow();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    trackScreen('PhoneNumberScreen');
  }, []);

  const showError = (errorKey: string, trackingKey: string) => {
    dispatch(
      showNotification({
        title: t('errors.pleaseTryAgain'),
        description: t(errorKey),
        type: 'error',
      }),
    );

    trackEvent(trackingKey);
    setIsLoading(false);
  };

  const handlePhoneSubmit = async () => {
    setIsLoading(true);

    if (!phoneNumber) {
      showError('errors.phoneNumberEmpty', 'phone_number_empty');
      return;
    }

    const isValid = phoneInputRef.current?.isValidNumber(phoneNumber);
    if (!isValid) {
      showError('errors.phoneNumberInvalid', 'phone_number_invalid');
      return;
    }

    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);

      trackEvent('phone_number_submitted');
      setIsLoading(false);
    } catch (error) {
      showError('errors.phoneNumberAPIError', 'phone_number_api_error');
      crashlytics().recordError(error);
    }
  };

  const checkIfUserRegistered = async (uid: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        dispatch(setUserData(userDoc.data()));
        return { isRegistered: true };
      }

      const partnerQuery = await firestore()
        .collection('partners')
        .where('partnerPhoneNumbers', 'array-contains', phoneNumber)
        .get();

      const hasPartner = !partnerQuery.empty;
      let partnerData = null;

      if (hasPartner) {
        partnerData = partnerQuery.docs[0].data();
        setPartnersData(partnerData);

        dispatch(
          showNotification({
            title: t('success'),
            description: t('auth.verificationCodeScreen.partnerFound'),
            type: 'success',
          }),
        );
      }

      return { isRegistered: false, hasPartner };
    } catch (error) {
      crashlytics().recordError(error);
      return { error };
    }
  };

  const onVerificationCodeSubmit = async () => {
    setIsLoading(true);

    if (!code) {
      showError('errors.verificationCodeEmpty', 'verification_code_empty');
      return;
    }

    try {
      await confirm?.confirm(code);
      trackEvent('confirmed_verification_code');

      const user = auth().currentUser;
      dispatch(setUser(user));

      const {
        error,
        hasPartner,
        isRegistered,
      }: {
        error?: object;
        hasPartner?: boolean;
        isRegistered: boolean;
      } = await checkIfUserRegistered(user.uid);

      if (error) {
        showError(
          'errors.registrationCheckFailed',
          'registration_check_failed',
        );

        return;
      }

      if (!isRegistered) {
        handleUserDetails({ phoneNumber });

        if (!hasPartner) {
          goToNextStep(Steps.PartnerDetailsStep);
          trackEvent('user_not_registered_no_partner');
        } else {
          goToNextStep(Steps.UserDetailsStep);
          trackEvent('user_not_registered_has_partner');
        }
      }

      setIsLoading(false);
    } catch (error) {
      showError('errors.invalidAPICode', 'invalid_api_code');
      crashlytics().recordError(error);
    }
  };

  const handleResendCode = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const confirmation = await auth().signInWithPhoneNumber(
        phoneNumber,
        true,
      );
      setConfirm(confirmation);

      trackEvent('verification_code_resent');
      setIsLoading(false);
    } catch (error) {
      showError(
        'errors.resendingVerificationCodeFailed',
        'resend_verification_code_failed',
      );

      crashlytics().recordError(error);
    }
  };

  return !confirm ? (
    <PhoneNumberScreen
      currentStep={currentStep}
      goToPreviousStep={goToPreviousStep}
      phoneInputRef={phoneInputRef}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      onPhoneSubmit={handlePhoneSubmit}
      isLoading={isLoading}
    />
  ) : (
    <VerificationCodeScreen
      code={code}
      currentStep={currentStep}
      goToPreviousStep={goToPreviousStep}
      isLoading={isLoading}
      onResendCode={handleResendCode}
      onVerificationCodeSubmit={onVerificationCodeSubmit}
      setCode={setCode}
    />
  );
}

export default PhoneNumberScreenContainer;
