import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { trackScreen } from '@lib/analytics';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';

import Layout from '../Layout';
import Question from '../QuestionView';
import { QuestionContainer } from './style';

function NonSubscribedScreen() {
  const { t } = useTranslation();

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);

  useEffect(() => {
    trackScreen('NonSubscribedScreen');
  }, []);

  return (
    <Layout>
      <NonSubscriberNotification />
      <QuestionContainer
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white">
        <Question
          partner={partnerData}
          text={t('questionScreen.nonSubscriberScreen.default.text')}
          timeRemaining="22h 6m 31s"
          user={userData}
        />
      </QuestionContainer>
    </Layout>
  );
}

export default NonSubscribedScreen;
