import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import PhoneNumberScreen from '@components/shared/AuthScreens/PhoneNumberScreen';
import EnterCodeScreen from '@components/shared/AuthScreens/EnterCodeScreen';
import UserDetailsScreen from '@components/shared/AuthScreens/UserDetailsScreen';
import BirthdayScreen from '@components/shared/AuthScreens/BirthdayScreen';
import InvitePartnerScreen from '@components/shared/AuthScreens/InvitePartnerScreen';
import RelationshipStatusScreen from '@components/shared/AuthScreens/RelationshipStatusScreen';

import { AuthFlowProvider } from './AuthFlowContext';
import SignInScreen from './SignInScreen';

export type RootStackParamList = {
  SignIn: undefined;
  EnterPhoneNumber: undefined;
  EnterCode: undefined;
  UserDetails: undefined;
  Birthday: undefined;
  InvitePartner: undefined;
  RelationshipStatus: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function SignInScreenContainer() {
  return (
    <AuthFlowProvider>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          options={{ headerShown: false }}
          name="SignIn"
          component={SignInScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="EnterPhoneNumber"
          component={PhoneNumberScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="EnterCode"
          component={EnterCodeScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="UserDetails"
          component={UserDetailsScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="Birthday"
          component={BirthdayScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="InvitePartner"
          component={InvitePartnerScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="RelationshipStatus"
          component={RelationshipStatusScreen}
        />
      </Stack.Navigator>
    </AuthFlowProvider>
  );
}

export default SignInScreenContainer;
