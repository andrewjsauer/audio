import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useNavigation } from '@react-navigation/native';
import { trackEvent, trackScreen } from '@lib/analytics';

interface AuthFlowContextProps {
  currentStep: number;
  totalSteps: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const AuthFlowContext = createContext<AuthFlowContextProps>({
  currentStep: 1,
  totalSteps: 5,
  goToNextStep: () => {},
  goToPreviousStep: () => {},
});

export function AuthFlowProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    trackScreen('SignInScreen');
  }, []);

  const steps = [
    'SignIn',
    'EnterPhoneNumber',
    'UserDetails',
    'Birthday',
    'InvitePartner',
    'RelationshipStatus',
  ];

  const totalSteps = steps.length;

  const pascalToSnakeCase = (str: string) => {
    return str.replace(
      /([A-Z])/g,
      (_, p1, offset) => (offset > 0 ? '_' : '') + p1.toLowerCase(),
    );
  };

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextScreen = steps[currentStep];

      setCurrentStep((prevStep) => prevStep + 1);
      navigation.navigate(nextScreen);

      trackEvent(`step_to_next_screen_${pascalToSnakeCase(nextScreen)}`);
    }
  }, [currentStep, navigation, steps, totalSteps]);

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
