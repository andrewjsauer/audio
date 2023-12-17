import React from 'react';
import { useSelector } from 'react-redux';

import { selectIsSubscriber } from '@store/auth/selectors';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';

import Layout from './Layout';
import HistoryScreen from './HistoryScreen';

function HistoryScreenContainer() {
  const isSubscribed = useSelector(selectIsSubscriber);

  return (
    <Layout>
      {!isSubscribed && <NonSubscriberNotification />}
      <HistoryScreen />
    </Layout>
  );
}

export default HistoryScreenContainer;
