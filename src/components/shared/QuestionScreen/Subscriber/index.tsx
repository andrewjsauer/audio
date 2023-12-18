import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectUserData, selectPartnershipId } from '@store/auth/selectors';
import {
  selectPartnerData,
  selectPartnershipData,
} from '@store/partnership/selectors';
import {
  selectCurrentQuestion,
  selectError,
  selectIsLoading,
  selectLastFailedAction,
} from '@store/question/selectors';

import { AppDispatch } from '@store/index';

import { fetchLatestQuestion } from '@store/question/thunks';
import { fetchPartnership } from '@store/partnership/thunks';

import { UserDataType } from '@lib/types';
import { trackEvent, trackScreen } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';

import Button from '@components/shared/Button';
import LoadingView from '@components/shared/LoadingView';

import Layout from '../Layout';
import Question from '../QuestionView';
import { Container, ErrorText } from './style';

function SubscriberScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const userData = useSelector<UserDataType>(selectUserData);
  const partnershipId = useSelector(selectPartnershipId);
  const partnerData = useSelector<UserDataType>(selectPartnerData);
  const partnershipData = useSelector(selectPartnershipData);

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const lastFailedAction = useSelector(selectLastFailedAction);
  const currentQuestion = useSelector(selectCurrentQuestion);

  useEffect(() => {
    trackScreen('SubscriberScreen');

    if (!partnershipData) {
      dispatch(fetchPartnership(partnershipId));
    }
  }, []);

  useEffect(() => {
    if (
      partnershipData &&
      partnershipData.latestQuestionId === currentQuestion.id
    ) {
      dispatch(fetchLatestQuestion(partnershipData));
    }
  }, [dispatch, partnershipData, currentQuestion]);

  useNotificationPermissions();

  const handleRetry = () => {
    if (lastFailedAction) {
      trackEvent('retry_button_clicked', {
        action: lastFailedAction.type,
      });

      dispatch({
        type: lastFailedAction.type,
        payload: lastFailedAction.payload,
      });
    }
  };

  let content = (
    <Question
      partner={partnerData}
      text="Whats the best date you two have been on together?"
      timeRemaining="22h 6m 31s"
      user={userData}
    />
  );

  if (isLoading) {
    content = <LoadingView />;
  }

  if (error) {
    content = (
      <>
        <ErrorText>{error || t('errors.whoops')}</ErrorText>
        <Button
          onPress={handleRetry}
          text={t('retry')}
          size="small"
          mode="error"
        />
      </>
    );
  }

  return (
    <Layout>
      <Container>{content}</Container>
    </Layout>
  );
}

export default SubscriberScreen;
