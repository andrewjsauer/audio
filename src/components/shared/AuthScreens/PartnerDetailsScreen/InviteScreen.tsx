import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import PhoneInputProp from 'react-native-phone-number-input';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import { v4 as uuidv4 } from 'uuid';

import Button from '@components/shared/Button';
import { useAuthFlow } from '@components/shared/AuthScreens/AuthFlowContext';
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
  } = useAuthFlow();

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

  async function sendSmsToPartner(data: {
    partnerName: string;
    phoneNumber: string;
  }) {
    try {
      await functions().httpsCallable('sendPartnerInvite')(data);
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('send_sms_invite_partner_api_error');
    }
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
      const partnershipId = uuidv4();

      const partnerData = {
        id: partnershipId,
        partner1Id: user.uid,
        partner2Name: partnerName,
        partnerPhoneNumbers: [phoneNumber],
        relationshipDate,
        relationshipType,
      };

      const partnerRef = firestore().collection('partners').doc(partnershipId);
      await partnerRef.set(partnerData, { merge: true });

      await sendSmsToPartner({ partnerName, phoneNumber });

      dispatch(setPartnersData(partnerData));
      setIsLoading(false);

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
