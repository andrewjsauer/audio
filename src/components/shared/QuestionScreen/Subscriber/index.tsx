import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { selectUserData } from '@store/auth/selectors';
import {
  selectError,
  selectIsLoading,
  selectLastFailedAction,
  selectPartnerData,
  selectPartnershipData,
} from '@store/partnership/selectors';
import { selectCurrentQuestion, selectIsLoadingQuestion } from '@store/question/selectors';
import {
  selectPartnerRecording,
  selectPartnerRecordingStatus,
  selectUserRecording,
  selectUserRecordingStatus,
  selectUserReactionToPartnerType,
  selectPartnerReactionToUserType,
} from '@store/recording/selectors';

import { AppDispatch } from '@store/index';

import { fetchPartnership, fetchPartnerData } from '@store/partnership/thunks';

import { trackScreen, trackEvent } from '@lib/analytics';

import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';
import useTimeRemainingToMidnight from '@lib/customHooks/useTimeRemainingToMidnight';
import useRecordingSubscription from '@lib/customHooks/useRecordingSubscription';
import useListeningSubscription from '@lib/customHooks/useListeningSubscription';
import useQuestionSubscription from '@lib/customHooks/useQuestionSubscription';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import Layout from '../Layout';
import Question from '../QuestionView';
import { Container } from './style';

function SubscriberScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const currentQuestion = useSelector(selectCurrentQuestion);
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);
  const isLoadingQuestion = useSelector(selectIsLoadingQuestion);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const partnerData = useSelector(selectPartnerData);
  const partnerReactionToUser = useSelector(selectPartnerReactionToUserType);
  const partnerRecording = useSelector(selectPartnerRecording);
  const partnershipData = useSelector(selectPartnershipData);
  const partnerStatus = useSelector(selectPartnerRecordingStatus);
  const userData = useSelector(selectUserData);
  const userReactionToPartner = useSelector(selectUserReactionToPartnerType);
  const userRecording = useSelector(selectUserRecording);
  const userStatus = useSelector(selectUserRecordingStatus);

  useEffect(() => {
    trackScreen('SubscriberScreen');
    if (!partnershipData) dispatch(fetchPartnership(userData.partnershipId));
  }, []);

  useNotificationPermissions();

  useRecordingSubscription({
    userData,
    partnerData,
    questionId: currentQuestion?.id,
  });

  useListeningSubscription({
    partnerData,
    partnerRecordingId: partnerRecording?.id,
    userData,
    userRecordingId: userRecording?.id,
  });

  useQuestionSubscription();

  const timeRemaining = useTimeRemainingToMidnight();

  const handleRetry = () => {
    trackEvent('retry_button_clicked', {
      action: lastFailedAction.type,
    });

    if (lastFailedAction && lastFailedAction.type === fetchPartnership.typePrefix) {
      dispatch(fetchPartnership(lastFailedAction.payload));
    } else if (lastFailedAction && lastFailedAction.type === fetchPartnerData.typePrefix) {
      dispatch(fetchPartnerData(lastFailedAction.payload));
    }
  };

  let content = (
    <Question
      partner={partnerData}
      partnerReactionToUser={partnerReactionToUser}
      partnerRecording={partnerRecording}
      partnerStatus={partnerStatus}
      text={currentQuestion?.text}
      timeRemaining={timeRemaining}
      user={userData}
      userReactionToPartner={userReactionToPartner}
      userRecording={userRecording}
      userStatus={userStatus}
    />
  );

  if (isLoading || isLoadingQuestion) {
    content = <LoadingView />;
  }

  if (error) {
    content = <ErrorView error={error} onRetry={handleRetry} />;
  }

  return (
    <Layout isLoading={isLoading}>
      <Container>{content}</Container>
    </Layout>
  );
}

export default SubscriberScreen;
