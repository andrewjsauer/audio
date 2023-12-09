import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { PartnerDetailsSteps as Steps } from '@lib/types';

import PartnerNameScreen from './PartnerNameScreen';
import RelationshipTypeScreen from './RelationshipTypeScreen';
import RelationshipDateScreen from './RelationshipDateScreen';
import InviteScreen from './InviteScreen';

export type RootStackParamList = {
  [Steps.PartnerNameStep]: undefined;
  [Steps.RelationshipTypeStep]: undefined;
  [Steps.RelationshipDateStep]: undefined;
  [Steps.InviteStep]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function PartnerDetailsScreen() {
  return (
    <Stack.Navigator initialRouteName={Steps.PartnerNameStep}>
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
  );
}

export default PartnerDetailsScreen;
