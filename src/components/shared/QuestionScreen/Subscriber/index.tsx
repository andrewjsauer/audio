import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { selectUserId } from '@store/auth/selectors';

import { fetchPartnerData } from '@store/partnership/thunks';

import { trackScreen } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';

import Layout from '../Layout';
import { StyledView, StyledText } from './style';

function SubscriberScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const userId = useSelector(selectUserId);

  useEffect(() => {
    trackScreen('SubscriberScreen');
    dispatch(fetchPartnerData(userId));
  }, []);

  useNotificationPermissions();

  // if not subscribed then show fixed NonSubscribedScreen based upon mocks
  // with notification handler and button to subscribe
  // Make shared layout so settings button is always there

  return (
    <Layout>
      <StyledView>
        <StyledText>You are subscribed</StyledText>
      </StyledView>
    </Layout>
  );
}

export default SubscriberScreen;
