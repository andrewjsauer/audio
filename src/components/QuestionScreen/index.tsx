import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import { selectIsSubscribed } from '@store/auth/selectors';

import { QuestionScreens, ModalScreens } from '@lib/types';

import SubscriberScreen from '@components/QuestionScreen/Subscriber';
import NonSubscriberScreen from '@components/QuestionScreen/NonSubscriber';
import RecordUserModal from '@components/QuestionScreen/RecordUserModal';
import PlayUserModal from '@components/shared/PlayUserModal';

export type QuestionStackParamList = {
  [QuestionScreens.QuestionSubscriberScreen]: typeof SubscriberScreen;
  [QuestionScreens.QuestionNonSubscriberScreen]: typeof NonSubscriberScreen;
  [ModalScreens.RecordUserModal]: typeof RecordUserModal;
  [ModalScreens.PlayUserModal]: typeof PlayUserModal;
};

const Stack = createStackNavigator<QuestionStackParamList>();

function QuestionScreen() {
  const isSubscribed = useSelector(selectIsSubscribed);

  return (
    <Stack.Navigator>
      {isSubscribed ? (
        <>
          <Stack.Group>
            <Stack.Screen
              component={SubscriberScreen}
              name={QuestionScreens.QuestionSubscriberScreen}
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
            <Stack.Screen name={ModalScreens.RecordUserModal} component={RecordUserModal} />
            <Stack.Screen name={ModalScreens.PlayUserModal} component={PlayUserModal} />
          </Stack.Group>
        </>
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
