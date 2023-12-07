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

interface AuthFlowContextProps {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const AuthFlowContext = createContext<AuthFlowContextProps>({
  currentStep: 1,
  totalSteps: 5,
  goToPreviousStep: () => {},
  goToNextStep: () => {},
});

const steps = [
  Steps.SignInStep,
  Steps.PhoneNumberStep,
  Steps.UserDetailsStep,
  Steps.PartnerDetailsStep,
];

export function AuthFlowProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = steps.length;

  const pascalToSnakeCase = (str: string) => {
    return str.replace(
      /([A-Z])/g,
      (_, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase(),
    );
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
        navigation.navigate(nextScreen);
        trackEvent(`step_to_next_screen_${pascalToSnakeCase(nextScreen)}`);
      }
    },
    [currentStep, navigation, steps, totalSteps],
  );

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const previousScreen = steps[currentStep - 2];

      setCurrentStep((prevStep) => prevStep - 1);
      navigation.navigate(previousScreen);

      trackEvent(
        `step_to_previous_screen_${pascalToSnakeCase(previousScreen)}`,
      );
    }
  }, [currentStep, navigation, steps]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      totalSteps,
      goToNextStep,
      goToPreviousStep,
    }),
    [currentStep, totalSteps, goToNextStep, goToPreviousStep],
  );

  return (
    <AuthFlowContext.Provider value={contextValue}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export const useAuthFlow = () => useContext(AuthFlowContext);
