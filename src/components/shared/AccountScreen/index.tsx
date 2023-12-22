import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { trackScreen } from '@lib/analytics';
import { AccountScreens } from '@lib/types';

import SettingsScreen from './SettingsScreen';
import ColorScreen from './ColorScreen';
import NameScreen from './NameScreen';

export type AccountStackParamList = {
  [AccountScreens.SettingsScreen]: typeof SettingsScreen;
  [AccountScreens.ColorScreen]: typeof SettingsScreen;
  [AccountScreens.NameScreen]: typeof SettingsScreen;
};

const Stack = createStackNavigator<AccountStackParamList>();

function AccountScreenContainer() {
  useEffect(() => {
    trackScreen('AccountScreen');
  }, []);

  return (
    <Stack.Navigator initialRouteName={AccountScreens.SettingsScreen}>
      <Stack.Screen component={SettingsScreen} name={AccountScreens.SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen component={ColorScreen} name={AccountScreens.ColorScreen} options={{ headerShown: false }} />
      <Stack.Screen component={NameScreen} name={AccountScreens.NameScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default AccountScreenContainer;
