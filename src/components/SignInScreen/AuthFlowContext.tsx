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
  totalSteps: 6,
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
    'EnterCode',
    'UserDetails',
    'Birthday',
    'InvitePartner',
    'RelationshipStatus',
  ];

  const totalSteps = steps.length;

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextScreen = steps[currentStep];

      setCurrentStep((prevStep) => prevStep + 1);
      navigation.navigate(nextScreen);

      trackEvent(`Step to next screen: ${nextScreen}`);
    }
  }, [currentStep, navigation, steps, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const previousScreen = steps[currentStep - 2];

      setCurrentStep((prevStep) => prevStep - 1);
      navigation.navigate(previousScreen);

      trackEvent(`Step to previous screen: ${previousScreen}`);
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
