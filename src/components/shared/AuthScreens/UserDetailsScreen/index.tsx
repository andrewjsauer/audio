import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { UserDetailsSteps as Steps } from '@lib/types';

import UserNameScreen from './UserNameScreen';
import BirthdayScreen from './BirthdayScreen';

export type RootStackParamList = {
  [Steps.UserNameStep]: undefined;
  [Steps.BirthdayStep]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function UserDetailsScreen() {
  return (
    <Stack.Navigator initialRouteName={Steps.UserNameStep}>
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
    </Stack.Navigator>
  );
}

export default UserDetailsScreen;
