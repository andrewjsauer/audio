import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigation } from '@react-navigation/native';

import { SignInFlowStepTypes as Steps } from '@lib/types';
import { trackEvent } from '@lib/analytics';

interface UserDetails {
  birthDate?: Date;
  color?: string;
  name?: string;
  phoneNumber?: string;
}

interface PartnerDetails {
  name?: string;
  phoneNumber?: string;
  relationshipDate?: Date;
  relationshipType?: string;
}

interface AuthFlowContextProps {
  currentStep: number;
  totalSteps: number;
  goToNextStep: (step?: string) => void;
  goToPreviousStep: (arg0: string | void) => void;
  handleUserDetails: (newDetails: UserDetails) => void;
  handlePartnerDetails: (newDetails: PartnerDetails) => void;
  userDetails: UserDetails;
  partnerDetails: PartnerDetails;
}

const AuthFlowContext = createContext<AuthFlowContextProps>({
  currentStep: 1,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  handlePartnerDetails: () => {},
  handleUserDetails: () => {},
  partnerDetails: {},
  totalSteps: 5,
  userDetails: {},
});

const steps = [
  Steps.SignInStep,
  Steps.PhoneNumberStep,
  Steps.UserDetailsStep,
  Steps.PartnerDetailsStep,
];

export function AuthFlowProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();

  const [userDetails, setUserDetails] = useState<UserDetails>({});
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails>({});
  const [currentStep, setCurrentStep] = useState(1);

  console.log('partnerDetails', partnerDetails);
  console.log('userDetails', userDetails);

  const totalSteps = steps.length;

  const handlePartnerDetails = (newDetails: PartnerDetails) => {
    setPartnerDetails((prevDetails) => ({
      ...prevDetails,
      ...newDetails,
    }));
  };

  const handleUserDetails = (newDetails: UserDetails) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      ...newDetails,
    }));
  };

  const pascalToSnakeCaseAnd40CharMax = (str: string) => {
    return str
      .replace(
        /([A-Z])/g,
        (_, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase(),
      )
      .slice(0, 40);
  };

  const goToNextStep = useCallback(
    (nextStepName?: string) => {
      let nextScreen = nextStepName;

      if (!nextScreen) {
        if (currentStep < totalSteps) {
          nextScreen = steps[currentStep];
          setCurrentStep((prevStep) => prevStep + 1);
        }
      } else {
        const stepIndex = steps.indexOf(nextStepName);
        if (stepIndex >= 0) {
          setCurrentStep(stepIndex + 1);
        }
      }

      if (nextScreen) {
        console.log('nextScreen', nextScreen);

        navigation.navigate(nextScreen);
        trackEvent(
          `step_to_next_screen_${pascalToSnakeCaseAnd40CharMax(nextScreen)}`,
        );
      }
    },
    [currentStep, navigation, steps, totalSteps],
  );

  const goToPreviousStep = useCallback(
    (prevStepName?: string) => {
      let prevScreen = prevStepName;

      if (!prevScreen) {
        if (currentStep > 1) {
          prevScreen = steps[currentStep - 2];
          setCurrentStep((prevStep) => prevStep - 1);
        }
      } else {
        const stepIndex = steps.indexOf(prevStepName);
        if (stepIndex >= 0) {
          setCurrentStep(stepIndex + 1);
        }
        prevScreen = prevStepName;
      }

      if (prevScreen) {
        navigation.navigate(prevScreen);
        trackEvent(
          `step_to_previous_screen_${pascalToSnakeCaseAnd40CharMax(
            prevScreen,
          )}`,
        );
      }
    },
    [currentStep, navigation, steps],
  );

  const contextValue = useMemo(
    () => ({
      currentStep,
      goToNextStep,
      goToPreviousStep,
      handlePartnerDetails,
      handleUserDetails,
      partnerDetails,
      totalSteps,
      userDetails,
    }),
    [
      currentStep,
      totalSteps,
      userDetails,
      partnerDetails,
      goToNextStep,
      goToPreviousStep,
    ],
  );

  return (
    <AuthFlowContext.Provider value={contextValue}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export const useAuthFlow = () => useContext(AuthFlowContext);
