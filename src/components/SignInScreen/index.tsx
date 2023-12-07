import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import PhoneNumberScreen from '@components/shared/AuthScreens/PhoneNumberScreen';
import UserDetailsScreen from '@components/shared/AuthScreens/UserDetailsScreen';
import PartnerDetailsScreen from '@components/shared/AuthScreens/PartnerDetailsScreen';

import { SignInFlowStepTypes as Steps } from '@lib/types';

import { AuthFlowProvider } from './AuthFlowContext';
import SignInScreen from './SignInScreen';

export type RootStackParamList = {
  [Steps.SignInStep]: undefined;
  [Steps.PhoneNumberStep]: undefined;
  [Steps.UserDetailsStep]: undefined;
  [Steps.PartnerDetailsStep]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function SignInScreenContainer() {
  return (
    <AuthFlowProvider>
      <Stack.Navigator initialRouteName={Steps.SignInStep}>
        <Stack.Screen
          options={{ headerShown: false }}
          name={Steps.SignInStep}
          component={SignInScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name={Steps.PhoneNumberStep}
          component={PhoneNumberScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name={Steps.UserDetailsStep}
          component={UserDetailsScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name={Steps.PartnerDetailsStep}
          component={PartnerDetailsScreen}
        />
      </Stack.Navigator>
    </AuthFlowProvider>
  );
}

export default SignInScreenContainer;
