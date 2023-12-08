import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PhoneInputProp from 'react-native-phone-number-input';
import firestore from '@react-native-firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import crashlytics from '@react-native-firebase/crashlytics';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/SignInScreen/AuthFlowContext';
import PhoneNumberInput from '@components/shared/PhoneNumberInput';

import { showNotification } from '@store/ui/slice';
import { selectUser } from '@store/app/selectors';
import { setPartnersData } from '@store/app/slice';

import { PartnerDetailsSteps, SignInFlowStepTypes } from '@lib/types';
import { trackEvent, trackScreen } from '@lib/analytics';

import Layout from '../Layout';
import {
  Container,
  ButtonWrapper,
  InputTitle,
  InputSubtitle,
  InputWrapper,
} from '../style';

function InviteScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const phoneInputRef = useRef<PhoneInputProp>(null);

  const user = useSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackScreen('InviteScreen');
  }, []);

  const {
    goToNextStep,
    goToPreviousStep,
    partnerDetails,
    handlePartnerDetails,
    userDetails,
  } = useAuthFlow();

  const { phoneNumber: usersPhoneNumber } = userDetails;
  const {
    name: partnerName,
    phoneNumber,
    relationshipDate,
    relationshipType,
  } = partnerDetails;

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

  async function sendSmsToPartner(
    phoneNumber: string,
    partnerName: string,
    partnerId: string,
  ) {
    // Call your cloud function or use Firebase Cloud Messaging to send an SMS
    // This is a placeholder function. Replace with your actual implementation.
  }

  const handleSendInvite = async () => {
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
      const partnerId = uuidv4();

      const partnerData = {
        id: partnerId,
        partner1Id: user.uid,
        partner2Name: partnerName,
        partnerPhoneNumbers: [phoneNumber, usersPhoneNumber],
        relationshipDate,
        relationshipType,
      };

      const partnerRef = firestore().collection('partners').doc(partnerId);
      await partnerRef.set(partnerData, { merge: true });

      // Send SMS via Firebase Cloud Messaging or your server (pseudocode)
      // You would typically call a cloud function to handle SMS sending
      await sendSmsToPartner(phoneNumber, partnerName, partnerId);

      setIsLoading(false);
      setPartnersData(partnerData);

      goToNextStep(SignInFlowStepTypes.UserDetailsStep);
    } catch (error) {
      showError('errors.invitePartnerAPIError', 'invite_partner_api_error');
      crashlytics().recordError(error);
    }
  };

  return (
    <Layout
      goBack={() => goToPreviousStep(PartnerDetailsSteps.RelationshipDateStep)}
      isBackButtonEnabled
      title={t('auth.partnerDetails.invitePartnerScreen.title')}>
      <Container>
        <InputWrapper>
          <InputTitle>
            {t('auth.partnerDetails.invitePartnerScreen.inputTitle')}
          </InputTitle>
          <PhoneNumberInput
            setPhoneNumber={(number) =>
              handlePartnerDetails({ phoneNumber: number })
            }
            phoneInputRef={phoneInputRef}
            phoneNumber={phoneNumber || ''}
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
