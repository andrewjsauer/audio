import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import { selectIsSubscriber, selectUserId } from '@store/auth/selectors';
import { fetchPartnerData } from '@store/partnership/thunks';
import { AppDispatch } from '@store/index';

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
  const dispatch = useDispatch<AppDispatch>();

  const userId = useSelector(selectUserId);

  useEffect(() => {
    dispatch(fetchPartnerData(userId));
  }, []);

  return (
    <Stack.Navigator>
      {isSubscribed ? (
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
