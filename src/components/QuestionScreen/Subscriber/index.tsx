import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectUserData, selectHasSeenPrivacyReminder } from '@store/auth/selectors';
import {
  selectError,
  selectLastFailedAction,
  selectPartnerData,
} from '@store/partnership/selectors';
import {
  selectCurrentQuestion,
  selectIsLoadingQuestion,
  selectIsInitializing,
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

import { trackEvent } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';
import useRecordingSubscription from '@lib/customHooks/useRecordingSubscription';
import useListeningSubscription from '@lib/customHooks/useListeningSubscription';
import useFetchQuestion from '@lib/customHooks/useFetchQuestion';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import Layout from '../Layout';
import Question from '../QuestionView';
import { Container, ReminderTitle, ReminderText, ReminderContainer } from './style';

function SubscriberScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const currentQuestion = useSelector(selectCurrentQuestion);
  const error = useSelector(selectError);
  const isInitializing = useSelector(selectIsInitializing);
  const isLoadingQuestion = useSelector(selectIsLoadingQuestion);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const partnerData = useSelector(selectPartnerData);
  const partnerReactionToUser = useSelector(selectPartnerReactionToUserType);
  const partnerRecording = useSelector(selectPartnerRecording);
  const partnerStatus = useSelector(selectPartnerRecordingStatus);
  const userData = useSelector(selectUserData);
  const userReactionToPartner = useSelector(selectUserReactionToPartnerType);
  const userRecording = useSelector(selectUserRecording);
  const userStatus = useSelector(selectUserRecordingStatus);
  const hasSeenPrivacyReminder = useSelector(selectHasSeenPrivacyReminder);

  useEffect(() => {
    trackEvent('Home Screen Seen');
  }, []);

  useFetchQuestion();

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

  const handleRetry = () => {
    trackEvent('retry_button_clicked', {
      action: lastFailedAction.type,
    });

    if (lastFailedAction && lastFailedAction.type === fetchLatestQuestion.typePrefix) {
      dispatch(fetchLatestQuestion(lastFailedAction.payload));
    }
  };

  let content = null;

  if (error) {
    content = <ErrorView error={error} onRetry={handleRetry} />;
  } else if (isInitializing || isLoadingQuestion) {
    content = <LoadingView />;
  } else if (currentQuestion && currentQuestion.text) {
    content = (
      <>
        <Question
          partner={partnerData}
          partnerReactionToUser={partnerReactionToUser}
          partnerRecording={partnerRecording}
          partnerStatus={partnerStatus}
          text={currentQuestion.text}
          user={userData}
          userReactionToPartner={userReactionToPartner}
          userRecording={userRecording}
          userStatus={userStatus}
        />
        {!hasSeenPrivacyReminder && (
          <ReminderContainer>
            <ReminderTitle>{t('questionScreen.privacyReminder.title')} 🗝️</ReminderTitle>
            <ReminderText>{t('questionScreen.privacyReminder.description')}</ReminderText>
          </ReminderContainer>
        )}
      </>
    );
  }

  return (
    <Layout isLoading={isInitializing || isLoadingQuestion}>
      <Container>{content}</Container>
    </Layout>
  );
}

export default SubscriberScreen;
