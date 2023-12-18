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
import { AppDispatch } from '@store/index';

import { trackEvent } from '@lib/analytics';
import useInitializeSession from '@lib/customHooks/useInitializeSession';
import { AppScreens } from '@lib/types';

import Button from '@components/shared/Button';
import LoadingView from '@components/shared/LoadingView';

import QuestionScreen from '@components/shared/QuestionScreen';
import HistoryScreen from '@components/shared/HistoryScreen';
import AccountScreen from '@components/shared/AccountScreen';
import TrialScreen from '@components/shared/TrialScreen';

import { StyledView, ErrorText } from './style';

export type AppStackParamList = {
  [AppScreens.QuestionScreen]: undefined;
  [AppScreens.HistoryScreen]: undefined;
  [AppScreens.AccountScreen]: undefined;
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
      Alert.alert(t('errors.errorPurchasing'), transactionError);
    }
  }, [transactionError]);

  const handleRetry = () => {
    if (lastFailedAction) {
      trackEvent('retry_button_clicked', {
        action: lastFailedAction.type,
      });

      dispatch({
        type: lastFailedAction.type,
        payload: lastFailedAction.payload,
      });
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <StyledView>
        <ErrorText>{error?.message || t('errors.whoops')}</ErrorText>
        <Button
          onPress={handleRetry}
          text={t('retry')}
          size="small"
          mode="error"
        />
      </StyledView>
    );
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
