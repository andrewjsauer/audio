import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { trackScreen } from '@lib/analytics';
import { AccountScreens } from '@lib/types';

import SettingsScreen from './SettingsScreen';
import ColorScreen from './ColorScreen';
import NameScreen from './NameScreen';
import LanguageScreen from './LanguageScreen';
import RelationshipTypeScreen from './RelationshipTypeScreen';
import TimeZoneScreen from './TimeZoneScreen';

export type AccountStackParamList = {
  [AccountScreens.ColorScreen]: typeof SettingsScreen;
  [AccountScreens.LanguageScreen]: typeof LanguageScreen;
  [AccountScreens.NameScreen]: typeof SettingsScreen;
  [AccountScreens.RelationshipTypeScreen]: typeof RelationshipTypeScreen;
  [AccountScreens.SettingsScreen]: typeof SettingsScreen;
  [AccountScreens.TimeZoneScreen]: typeof TimeZoneScreen;
};

const Stack = createStackNavigator<AccountStackParamList>();

function AccountScreenContainer() {
  useEffect(() => {
    trackScreen('AccountScreen');
  }, []);

  return (
    <Stack.Navigator initialRouteName={AccountScreens.SettingsScreen}>
      <Stack.Screen
        component={SettingsScreen}
        name={AccountScreens.SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ColorScreen}
        name={AccountScreens.ColorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={NameScreen}
        name={AccountScreens.NameScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={LanguageScreen}
        name={AccountScreens.LanguageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={RelationshipTypeScreen}
        name={AccountScreens.RelationshipTypeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={TimeZoneScreen}
        name={AccountScreens.TimeZoneScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default AccountScreenContainer;
