import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import PhoneNumberScreen from '@components/Auth/PhoneNumberScreen';
import UserNameScreen from '@components/Auth/UserNameScreen';
import BirthdayScreen from '@components/Auth/BirthdayScreen';
import PartnerNameScreen from '@components/Auth/PartnerNameScreen';
import RelationshipTypeScreen from '@components/Auth/RelationshipTypeScreen';
import RelationshipDateScreen from '@components/Auth/RelationshipDateScreen';
import InviteScreen from '@components/Auth/InviteScreen';
import SignInScreen from '@components/Auth/SignInScreen';

import { AuthScreens as Steps } from '@lib/types';

import { AuthFlowProvider } from '@components/Auth/AuthFlowContext';

export type RootStackParamList = {
  [Steps.SignInScreen]: undefined;
  [Steps.PhoneNumberStep]: undefined;
  [Steps.UserNameStep]: undefined;
  [Steps.BirthdayStep]: undefined;
  [Steps.PartnerNameStep]: undefined;
  [Steps.RelationshipTypeStep]: undefined;
  [Steps.RelationshipDateStep]: undefined;
  [Steps.InviteStep]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <AuthFlowProvider>
      <Stack.Navigator initialRouteName={Steps.SignInScreen}>
        <Stack.Screen
          component={SignInScreen}
          name={Steps.SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={PhoneNumberScreen}
          name={Steps.PhoneNumberStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={UserNameScreen}
          name={Steps.UserNameStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={BirthdayScreen}
          name={Steps.BirthdayStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={PartnerNameScreen}
          name={Steps.PartnerNameStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={RelationshipTypeScreen}
          name={Steps.RelationshipTypeStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={RelationshipDateScreen}
          name={Steps.RelationshipDateStep}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={InviteScreen}
          name={Steps.InviteStep}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </AuthFlowProvider>
  );
}

export default AuthStack;
