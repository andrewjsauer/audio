import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import PhoneNumberScreen from '@components/shared/AuthScreens/PhoneNumberScreen';
import UserDetailsScreen from '@components/shared/AuthScreens/UserDetailsScreen';
import PartnerDetailsScreen from '@components/shared/AuthScreens/PartnerDetailsScreen';

import { SignInFlowStepTypes as Steps } from '@lib/types';

import { AuthFlowProvider } from '@components/shared/AuthScreens/AuthFlowContext';
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
          component={SignInScreen}
          name={Steps.SignInStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={PhoneNumberScreen}
          name={Steps.PhoneNumberStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={UserDetailsScreen}
          name={Steps.UserDetailsStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={PartnerDetailsScreen}
          name={Steps.PartnerDetailsStep}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </AuthFlowProvider>
  );
}

export default SignInScreenContainer;
