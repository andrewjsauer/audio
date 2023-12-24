import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsSubscribed, selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';
import {
  selectError,
  selectIsLoading,
  selectLastFailedAction,
  selectQuestions,
} from '@store/history/selectors';

import { fetchHistoryData } from '@store/history/thunks';
import { AppDispatch } from '@store/index';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';
import { trackEvent, trackScreen } from '@lib/analytics';

import Layout from '@components/shared/Layout';
import HistoryScreen from './HistoryScreen';

function HistoryScreenContainer() {
  const dispatch = useDispatch<AppDispatch>();

  const isSubscribed = useSelector(selectIsSubscribed);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const questions = useSelector(selectQuestions);
  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);

  useEffect(() => {
    trackScreen('HistoryScreen');
    dispatch(
      fetchHistoryData({
        userData,
        partnerData,
      }),
    );
  }, []);

  const handleRetry = () => {
    if (lastFailedAction && lastFailedAction.type === fetchHistoryData.typePrefix) {
      trackEvent('retry_button_clicked', {
        action: lastFailedAction.type,
      });

      dispatch(fetchHistoryData(lastFailedAction.payload));
    }
  };

  return (
    <Layout titleKey="historyScreen.title" screen="history_screen">
      {!isSubscribed && <NonSubscriberNotification />}
      <HistoryScreen
        error={error}
        handleRetry={handleRetry}
        isBlurred={!isSubscribed}
        isLoading={isLoading}
        partnerId={partnerData?.id}
        partnerName={partnerData?.name}
        questions={questions}
        userId={userData?.id}
      />
    </Layout>
  );
}

export default HistoryScreenContainer;
