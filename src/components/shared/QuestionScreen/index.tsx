import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import { selectIsSubscriber } from '@store/auth/selectors';

import { QuestionScreens } from '@lib/types';

import SubscriberScreen from '@components/shared/QuestionScreen/Subscriber';
import NonSubscriberScreen from '@components/shared/QuestionScreen/NonSubscriber';

export type AppStackParamList = {
  [QuestionScreens.QuestionSubscriberScreen]: typeof SubscriberScreen;
  [QuestionScreens.QuestionNonSubscriberScreen]: typeof NonSubscriberScreen;
};

const Stack = createStackNavigator<AppStackParamList>();

function QuestionScreen() {
  const isSubscribed = useSelector(selectIsSubscriber);

  return (
    <Stack.Navigator>
      {true ? (
        <Stack.Screen
          component={SubscriberScreen}
          name={QuestionScreens.QuestionSubscriberScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          component={NonSubscriberScreen}
          name={QuestionScreens.QuestionNonSubscriberScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default QuestionScreen;
