import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { selectHasSubscribed } from '@store/auth/selectors';
import {
  selectError,
  selectIsConnected,
  selectIsLoading,
  selectLastFailedAction,
  selectShouldUpdateApp,
  selectTransactionError,
} from '@store/app/selectors';

import { initializeSession } from '@store/app/thunks';
import { setTransactionError } from '@store/app/slice';

import { AppDispatch } from '@store/index';

import { trackEvent } from '@lib/analytics';
import { AppScreens } from '@lib/types';

import useInitializeSession from '@lib/customHooks/useInitializeSession';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import AccountScreen from '@components/AccountScreen';
import HistoryScreen from '@components/HistoryScreen';
import QuestionScreen from '@components/QuestionScreen';
import TrialScreen from '@components/TrialScreen';

export type AppStackParamList = {
  [AppScreens.AccountScreen]: typeof AccountScreen;
  [AppScreens.HistoryScreen]: typeof HistoryScreen;
  [AppScreens.QuestionScreen]: typeof QuestionScreen;
  [AppScreens.TrialScreen]: typeof TrialScreen;
};

const Stack = createStackNavigator<AppStackParamList>();

function App(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const hasPreviouslySubscribed = useSelector(selectHasSubscribed);
  const transactionError = useSelector(selectTransactionError);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const shouldUpdateApp = useSelector(selectShouldUpdateApp);
  const isConnected = useSelector(selectIsConnected);

  useInitializeSession();

  useEffect(() => {
    if (transactionError) {
      Alert.alert(t('errors.errorPurchasing'), t(transactionError));
      dispatch(setTransactionError(null));
    }
  }, [transactionError]);

  const handleRetry = () => {
    if (lastFailedAction && lastFailedAction.type === initializeSession.typePrefix) {
      trackEvent('Retry Button Tapped', {
        action: lastFailedAction.type,
      });

      dispatch(initializeSession(lastFailedAction.payload));
    }
  };

  if (!isConnected) {
    return <ErrorView error="errors.offline" />;
  }

  if (isLoading || shouldUpdateApp) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView onRetry={handleRetry} error={error} />;
  }

  return (
    <Stack.Navigator>
      {true ? (
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
