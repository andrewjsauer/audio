import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import { trackScreen } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';

import Layout from '../Layout';
import Question from '../QuestionView';
import { QuestionContainer } from './style';

function SubscriberScreen() {
  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);

  useEffect(() => {
    trackScreen('SubscriberScreen');
  }, []);

  useNotificationPermissions();

  return (
    <Layout>
      <QuestionContainer>
        <Question
          partner={partnerData}
          text="Whats the best date you two have been on together?"
          timeRemaining="22h 6m 31s"
          user={userData}
        />
      </QuestionContainer>
    </Layout>
  );
}

export default SubscriberScreen;
