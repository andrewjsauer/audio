import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { selectUserData, selectPartnershipId } from '@store/auth/selectors';
import {
  selectError,
  selectIsLoading,
  selectLastFailedAction,
  selectPartnerData,
  selectPartnershipData,
} from '@store/partnership/selectors';
import {
  selectCurrentQuestion,
  selectIsLoadingQuestion,
} from '@store/question/selectors';
import {
  selectPartnerRecording,
  selectPartnerRecordingStatus,
  selectUserRecording,
  selectUserRecordingStatus,
  selectUserReactionToPartnerType,
  selectPartnerReactionToUserType,
} from '@store/recording/selectors';

import { AppDispatch } from '@store/index';

import { fetchLatestQuestion } from '@store/question/thunks';
import { fetchPartnership, fetchPartnerData } from '@store/partnership/thunks';

import { trackScreen, trackEvent } from '@lib/analytics';
import { QuestionType } from '@lib/types';

import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';
import useTimeRemainingToMidnight from '@lib/customHooks/useTimeRemainingToMidnight';
import useRecordingSubscription from '@lib/customHooks/useRecordingSubscription';
import useListeningSubscription from '@lib/customHooks/useListeningSubscription';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import Layout from '../Layout';
import Question from '../QuestionView';
import { Container } from './style';

function SubscriberScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const partnershipId = useSelector(selectPartnershipId);
  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);
  const partnershipData = useSelector(selectPartnershipData);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const isLoadingQuestion = useSelector(selectIsLoadingQuestion);
  const partnerStatus = useSelector(selectPartnerRecordingStatus);
  const userStatus = useSelector(selectUserRecordingStatus);
  const partnerRecording = useSelector(selectPartnerRecording);
  const userRecording = useSelector(selectUserRecording);
  const userReactionToPartner = useSelector(selectUserReactionToPartnerType);
  const partnerReactionToUser = useSelector(selectPartnerReactionToUserType);

  useEffect(() => {
    trackScreen('SubscriberScreen');

    if (!partnershipData) dispatch(fetchPartnership(partnershipId));
    if (!partnerData) dispatch(fetchPartnerData(userData.id));
  }, []);

  useEffect(() => {
    const isQuestionExpired = (question: QuestionType) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let questionCreatedAt;
      const { createdAt } = question;

      if (typeof createdAt === 'function') {
        questionCreatedAt = createdAt.toDate();
      } else questionCreatedAt = new Date(createdAt.seconds * 1000);

      return questionCreatedAt < today;
    };

    if (
      (!currentQuestion || isQuestionExpired(currentQuestion)) &&
      partnershipData &&
      partnerData
    ) {
      dispatch(fetchLatestQuestion({ partnershipData, partnerData, userData }));
    }
  }, [partnershipData?.id, currentQuestion, partnerData]);

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

  const timeRemaining = useTimeRemainingToMidnight();

  const handleRetry = () => {
    trackEvent('retry_button_clicked', {
      action: lastFailedAction.type,
    });

    if (
      lastFailedAction &&
      lastFailedAction.type === fetchPartnership.typePrefix
    ) {
      dispatch(fetchPartnership(lastFailedAction.payload));
    } else if (
      lastFailedAction &&
      lastFailedAction.type === fetchPartnerData.typePrefix
    ) {
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
