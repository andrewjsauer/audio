import React, { useEffect } from 'react';

import { trackScreen } from '@lib/analytics';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';

import Layout from '../Layout';
import { Container, StyledText } from './style';

function NonSubscribedScreen() {
  useEffect(() => {
    trackScreen('NonSubscribedScreen');
  }, []);

  return (
    <Layout>
      <NonSubscriberNotification />
      <Container>
        <StyledText>You are unsubscribed</StyledText>
      </Container>
    </Layout>
  );
}

export default NonSubscribedScreen;
