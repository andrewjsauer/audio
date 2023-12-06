import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// import EnterPhoneNumberScreen from '@components/shared/auth/EnterPhoneNumberScreen';
// import EnterCodeScreen from '@components/shared/auth/EnterCodeScreen';
// import UserDetailsScreen from '@components/shared/auth/UserDetailsScreen';
// import BirthdayScreen from '@components/shared/auth/BirthdayScreen';
// import InvitePartnerScreen from '@components/shared/auth/InvitePartnerScreen';
// import RelationshipStatusScreen from '@components/shared/auth/RelationshipStatusScreen';

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
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen
        options={{ headerShown: false }}
        name="SignIn"
        component={SignInScreen}
      />
    </Stack.Navigator>
  );
}

export default SignInScreenContainer;

{
  /* <Stack.Screen
name="EnterPhoneNumber"
component={EnterPhoneNumberScreen}
/>
<Stack.Screen name="EnterCode" component={EnterCodeScreen} />
<Stack.Screen name="UserDetails" component={UserDetailsScreen} />
<Stack.Screen name="Birthday" component={BirthdayScreen} />
<Stack.Screen name="InvitePartner" component={InvitePartnerScreen} />
<Stack.Screen
name="RelationshipStatus"
component={RelationshipStatusScreen}
/> */
}
