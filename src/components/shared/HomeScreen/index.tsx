import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { signOut } from '@store/app/thunks';
import { selectIsLoading, selectError } from '@store/app/selectors';

import { trackEvent, trackScreen } from '@lib/analytics';

import Button from '@components/shared/Button';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';
import usePartnersDataSubscription from '@lib/customHooks/usePartnersDataSubscription';

import SettingsIcon from '@assets/icons/settings.svg';

import {
  StyledActivityIndicator,
  StyledView,
  ErrorText,
  StyledText,
  LogoutButton,
} from './style';

function App(): JSX.Element {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useNotificationPermissions();

  usePartnersDataSubscription();

  useEffect(() => {
    trackScreen('HomeScreen');
  }, []);

  const handleLogout = () => {
    trackEvent('SignOut');
    dispatch(signOut());
  };

  // setup subscriber for "questions" collection on the user document

  // questions are generated when user opens the app so the first step is checking to see if we have a question, if not,
  // we hit the API and start generating one. If we do have a question, we check to see if it's expired (check if the date
  // is pass todays date), if it is, we generate a new one. If it's not expired, we show the question.

  // setup subscriber for "recordings" collection if the history tab is opened

  // once user has answered a question and partner has not downloaded or signed up, we SMS them in the Google cloud function
  let content;

  content = (
    <StyledView>
      <StyledText>You are logged in</StyledText>
    </StyledView>
  );

  if (isLoading) {
    content = (
      <StyledView>
        <StyledActivityIndicator size="small" />
      </StyledView>
    );
  }

  if (error) {
    content = (
      <StyledView>
        <ErrorText>{error?.message || t('errors.whoops')}</ErrorText>
        <Button
          onPress={handleLogout}
          text={t('retry')}
          size="small"
          mode="error"
        />
      </StyledView>
    );
  }

  return (
    <StyledView>
      <LogoutButton disabled={isLoading} onPress={handleLogout}>
        <SettingsIcon width={24} height={24} />
      </LogoutButton>
      {content}
    </StyledView>
  );
}

export default App;
