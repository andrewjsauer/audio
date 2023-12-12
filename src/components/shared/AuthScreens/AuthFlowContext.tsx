import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { selectUserData, selectUserId } from '@store/auth/selectors';
import { initializePartnership, updateUser } from '@store/auth/thunks';
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
  handlePartnershipDetails: (
    newDetails: Partial<PartnershipDetailsType>,
  ) => void;
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

  const isPartner = userData && !userData.isRegistered;

  const [userDetails, setUserDetails] = useState<UserDetailsType>({});
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetailsType>({});
  const [partnershipDetails, setPartnershipDetails] =
    useState<PartnershipDetailsType>({});
  const [currentStep, setCurrentStep] = useState(1);

  console.log('userDetails', userDetails);

  useEffect(() => {
    if (userData) {
      setUserDetails(userData);
    }
  }, [userData]);

  const steps = [
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
  ];

  const totalSteps = steps.length;

  const handlePartnerDetails = useCallback(
    (newDetails: Partial<PartnerDetailsType>) => {
      setPartnerDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
    },
    [],
  );

  const handleUserDetails = useCallback(
    (newDetails: Partial<UserDetailsType>) => {
      setUserDetails((prevDetails) => ({ ...prevDetails, ...newDetails }));
    },
    [],
  );

  const handlePartnershipDetails = useCallback(
    (newDetails: Partial<PartnershipDetailsType>) => {
      setPartnershipDetails((prevDetails) => ({
        ...prevDetails,
        ...newDetails,
      }));
    },
    [],
  );

  const pascalToSnakeCaseAnd40CharMax = (str: string) => {
    return str
      .replace(
        /([A-Z])/g,
        (_, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase(),
      )
      .slice(0, 40);
  };

  const navigateToStep = (stepIndex: number) => {
    const screen = steps[stepIndex - 1];

    if (screen) {
      navigation.navigate(screen);
      trackEvent(`step_to_screen_${pascalToSnakeCaseAnd40CharMax(screen)}`);
    }
  };

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prevStep) => {
        const nextStepIndex = prevStep + 1;
        navigateToStep(nextStepIndex);
        return nextStepIndex;
      });
    } else if (currentStep === totalSteps) {
      if (!isPartner) {
        dispatch(
          initializePartnership({
            partnerDetails,
            partnershipDetails,
            userDetails,
          }),
        );
      } else {
        dispatch(
          updateUser({
            id: userId,
            userDetails: { ...userDetails, isRegistered: true },
          }),
        );
      }
    }
  }, [
    currentStep,
    dispatch,
    isPartner,
    partnerDetails,
    totalSteps,
    userDetails,
  ]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => {
        const prevStepIndex = prevStep - 1;
        navigateToStep(prevStepIndex);
        return prevStepIndex;
      });
    }
  }, [currentStep]);

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

  return (
    <AuthFlowContext.Provider value={contextValue}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export const useAuthFlow = () => useContext(AuthFlowContext);
