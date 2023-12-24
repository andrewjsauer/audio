import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { HistoryScreens } from '@lib/types';

import PlayUserModal from '@components/shared/PlayUserModal';
import HistoryScreen from './History';

export type HistoryStackParamList = {
  [HistoryScreens.HistoryScreen]: typeof HistoryScreen;
  [HistoryScreens.PlayUserModal]: typeof PlayUserModal;
};

const Stack = createStackNavigator<HistoryStackParamList>();

function HistoryScreenContainer() {
  return (
    <Stack.Navigator initialRouteName={HistoryScreens.HistoryScreen}>
      <Stack.Group>
        <Stack.Screen
          component={HistoryScreen}
          name={HistoryScreens.HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name={HistoryScreens.PlayUserModal} component={PlayUserModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default HistoryScreenContainer;
