import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsSubscribed, selectUserData } from '@store/auth/selectors';
import { selectPartnerData, selectPartnershipTimeZone } from '@store/partnership/selectors';
import {
  selectError,
  selectIsLoading,
  selectLastFailedAction,
  selectFormattedQuestions,
  selectIsEndReached,
} from '@store/history/selectors';

import { fetchHistoryData, fetchMoreHistoryData } from '@store/history/thunks';
import { AppDispatch } from '@store/index';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';
import { trackEvent } from '@lib/analytics';

import Layout from '@components/shared/Layout';
import HistoryScreen from './HistoryScreen';

function HistoryScreenContainer() {
  const dispatch = useDispatch<AppDispatch>();

  const isSubscribed = useSelector(selectIsSubscribed);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const questions = useSelector(selectFormattedQuestions);
  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);
  const timeZone = useSelector(selectPartnershipTimeZone);
  const isEndReached = useSelector(selectIsEndReached);

  useEffect(() => {
    trackEvent('History Screen Seen');
    dispatch(fetchHistoryData());
  }, []);

  const handleRetry = () => {
    if (lastFailedAction && lastFailedAction.type === fetchHistoryData.typePrefix) {
      trackEvent('Retry Button Tapped', {
        action: lastFailedAction.type,
      });

      dispatch(fetchHistoryData());
    } else if (lastFailedAction && lastFailedAction.type === fetchMoreHistoryData.typePrefix) {
      trackEvent('Retry Button Tapped', {
        action: lastFailedAction.type,
      });

      dispatch(fetchMoreHistoryData());
    }
  };

  const handleEndReached = () => {
    trackEvent('History List End Reached', { action: 'fetch_more_history_data' });
    dispatch(fetchMoreHistoryData());
  };

  return (
    <Layout titleKey="historyScreen.title" screen="History Screen">
      {!isSubscribed && <NonSubscriberNotification />}
      <HistoryScreen
        error={error}
        handleRetry={handleRetry}
        isBlurred={false}
        isEndReached={isEndReached}
        isLoading={isLoading}
        onEndReached={handleEndReached}
        partnerId={partnerData?.id}
        partnerName={partnerData?.name}
        questions={questions}
        timeZone={timeZone}
        userId={userData?.id}
      />
    </Layout>
  );
}

export default HistoryScreenContainer;
