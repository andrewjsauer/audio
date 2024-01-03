import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { selectUserData, selectUserId, selectIsPartner } from '@store/auth/selectors';
import { generatePartnership, updateNewUser } from '@store/auth/thunks';
import { AppDispatch } from '@store/index';

import {
  AuthScreens as Steps,
  PartnerDetailsType,
  PartnershipDetailsType,
  UserDetailsType,
} from '@lib/types';

import { trackEvent } from '@lib/analytics';

interface AuthFlowContextProps {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleUserDetails: (newDetails: Partial<UserDetailsType>) => void;
  handlePartnerDetails: (newDetails: Partial<PartnerDetailsType>) => void;
  handlePartnershipDetails: (newDetails: Partial<PartnershipDetailsType>) => void;
  userDetails: UserDetailsType;
  partnerDetails: PartnerDetailsType;
  partnershipDetails: PartnershipDetailsType;
}

const AuthFlowContext = createContext<AuthFlowContextProps>({
  currentStep: 1,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  handlePartnerDetails: () => {},
  handlePartnershipDetails: () => {},
  handleUserDetails: () => {},
  partnerDetails: {},
  partnershipDetails: {},
  totalSteps: 8,
  userDetails: {},
});

export function AuthFlowProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector(selectUserData);
  const userId = useSelector(selectUserId);
  const isPartner = useSelector(selectIsPartner);

  const [userDetails, setUserDetails] = useState<UserDetailsType>({});
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetailsType>({});
  const [partnershipDetails, setPartnershipDetails] = useState<PartnershipDetailsType>({});
  const [currentStep, setCurrentStep] = useState(1);

  const steps = useMemo(
    () => [
      Steps.SignInScreen,
      Steps.PhoneNumberStep,
      ...(!isPartner
        ? [
            Steps.UserNameStep,
            Steps.BirthdayStep,
            Steps.PartnerNameStep,
            Steps.RelationshipTypeStep,
            Steps.RelationshipDateStep,
            Steps.InviteStep,
          ]
        : [Steps.UserNameStep, Steps.BirthdayStep]),
    ],
    [isPartner],
  );

  const totalSteps = steps.length;

  const handlePartnerDetails = useCallback((newDetails: Partial<PartnerDetailsType>) => {
    setPartnerDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
  }, []);

  const handleUserDetails = useCallback((newDetails: Partial<UserDetailsType>) => {
    setUserDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
  }, []);

  const handlePartnershipDetails = useCallback((newDetails: Partial<PartnershipDetailsType>) => {
    setPartnershipDetails((prevDetails) => ({
      ...prevDetails,
      ...newDetails,
    }));
  }, []);

  const pascalToSnakeCaseAnd40CharMax = (str: string) => {
    return str
      .replace(/([A-Z])/g, (_, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase())
      .slice(0, 40);
  };

  const navigateToStep = (stepIndex: number) => {
    const screen = steps[stepIndex - 1];

    if (screen) {
      navigation.navigate(screen);
      trackEvent(`step_to_screen_${pascalToSnakeCaseAnd40CharMax(screen)}`);
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prevStep) => {
        const nextStepIndex = prevStep + 1;

        setTimeout(() => navigateToStep(nextStepIndex), 0);
        return nextStepIndex;
      });
    } else if (currentStep === totalSteps) {
      if (!isPartner) {
        dispatch(
          generatePartnership({
            partnerDetails,
            partnershipDetails,
            userDetails,
          }),
        );
      } else if (isPartner && userData) {
        dispatch(
          updateNewUser({
            id: userId,
            tempId: userData.id,
            userDetails: { ...userDetails, isRegistered: true },
          }),
        );
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => {
        const prevStepIndex = prevStep - 1;

        setTimeout(() => navigateToStep(prevStepIndex), 0);
        return prevStepIndex;
      });
    }
  };

  const contextValue = useMemo(
    () => ({
      currentStep,
      goToNextStep,
      goToPreviousStep,
      handlePartnerDetails,
      handlePartnershipDetails,
      handleUserDetails,
      partnerDetails,
      partnershipDetails,
      totalSteps,
      userDetails,
    }),
    [
      currentStep,
      goToNextStep,
      goToPreviousStep,
      handlePartnerDetails,
      handlePartnershipDetails,
      handleUserDetails,
      partnerDetails,
      partnershipDetails,
      totalSteps,
      userDetails,
    ],
  );

  return <AuthFlowContext.Provider value={contextValue}>{children}</AuthFlowContext.Provider>;
}

export const useAuthFlow = () => useContext(AuthFlowContext);
