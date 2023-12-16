import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import crashlytics from '@react-native-firebase/crashlytics';

import { RootScreens } from '@lib/types';

import {
  selectIsUserLoggedIn,
  selectIsUserRegistered,
} from '@store/auth/selectors';

import AuthStack from '@components/Auth';
import AppStack from '@components/App';

export type RootStackParamList = {
  [RootScreens.AuthStack]: undefined;
  [RootScreens.AppStack]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  useEffect(() => {
    crashlytics().log('Application mounted');
  }, []);

  const isUserLoggedIn = useSelector(selectIsUserLoggedIn);
  const isUserAlreadyRegistered = useSelector(selectIsUserRegistered);

  return (
    <Stack.Navigator>
      {isUserLoggedIn && isUserAlreadyRegistered ? (
        <Stack.Screen
          component={AppStack}
          name={RootScreens.AppStack}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          component={AuthStack}
          name={RootScreens.AuthStack}
          options={{
            headerShown: false,
            animationTypeForReplace: !isUserLoggedIn ? 'pop' : 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
}

export default App;
