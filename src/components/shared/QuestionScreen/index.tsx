import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';

import { fetchPartnerData } from '@store/partnership/thunks';
import { signOut } from '@store/app/thunks';

import { trackEvent, trackScreen } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';

import SettingsIcon from '@assets/icons/settings.svg';

import { StyledView, StyledText, LogoutButton } from './style';

function QuestionScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const userId = useSelector(selectUserId);

  useEffect(() => {
    trackScreen('QuestionScreen');
    dispatch(fetchPartnerData(userId));
  }, []);

  useNotificationPermissions();

  const handleLogout = () => {
    trackEvent('sign_out_button_clicked');
    dispatch(signOut(userId));
  };

  return (
    <StyledView>
      <LogoutButton onPress={handleLogout}>
        <SettingsIcon width={24} height={24} />
      </LogoutButton>
      <StyledView>
        <StyledText>You are logged in</StyledText>
      </StyledView>
    </StyledView>
  );
}

export default QuestionScreen;
