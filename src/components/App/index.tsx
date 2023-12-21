import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  selectError,
  selectIsLoading,
  selectIsPreviouslySubscribed,
  selectLastFailedAction,
  selectTransactionError,
} from '@store/app/selectors';

import { initializeSession } from '@store/app/thunks';

import { AppDispatch } from '@store/index';

import { trackEvent } from '@lib/analytics';
import useInitializeSession from '@lib/customHooks/useInitializeSession';
import { AppScreens } from '@lib/types';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import AccountScreen from '@components/shared/AccountScreen';
import BrowserScreen from '@components/shared/BrowserScreen';
import HistoryScreen from '@components/shared/HistoryScreen';
import QuestionScreen from '@components/shared/QuestionScreen';
import TrialScreen from '@components/shared/TrialScreen';

export type AppStackParamList = {
  [AppScreens.AccountScreen]: undefined;
  [AppScreens.BrowserScreen]: undefined;
  [AppScreens.HistoryScreen]: undefined;
  [AppScreens.QuestionScreen]: undefined;
  [AppScreens.TrialScreen]: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

function App(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isPreviouslySubscribed = useSelector(selectIsPreviouslySubscribed);
  const transactionError = useSelector(selectTransactionError);
  const lastFailedAction = useSelector(selectLastFailedAction);

  useInitializeSession();

  useEffect(() => {
    if (transactionError) {
      Alert.alert(t('errors.errorPurchasing'), t(transactionError));
    }
  }, [transactionError]);

  const handleRetry = () => {
    if (
      lastFailedAction &&
      lastFailedAction.type === initializeSession.typePrefix
    ) {
      trackEvent('retry_button_clicked', {
        action: lastFailedAction.type,
      });

      dispatch(initializeSession(lastFailedAction.payload));
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView onRetry={handleRetry} error={error} />;
  }

  return (
    <Stack.Navigator>
      {isPreviouslySubscribed ? (
        <>
          <Stack.Screen
            component={QuestionScreen}
            name={AppScreens.QuestionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            component={HistoryScreen}
            name={AppScreens.HistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            component={AccountScreen}
            name={AppScreens.AccountScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            component={BrowserScreen}
            name={AppScreens.BrowserScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen
          component={TrialScreen}
          name={AppScreens.TrialScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default App;
