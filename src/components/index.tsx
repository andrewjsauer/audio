import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { RootScreens, AppScreens } from '@lib/types';

import { selectIsUserLoggedIn, selectIsUserRegistered } from '@store/auth/selectors';

import AuthStack from '@components/Auth';
import AppStack from '@components/App';
import BrowserScreen from '@components/shared/BrowserScreen';

export type RootStackParamList = {
  [RootScreens.AuthStack]: typeof AuthStack;
  [RootScreens.AppStack]: typeof AppStack;
  [AppScreens.BrowserScreen]: typeof BrowserScreen;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  useEffect(() => {
    SplashScreen.hide();
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
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        component={BrowserScreen}
        name={AppScreens.BrowserScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default App;
