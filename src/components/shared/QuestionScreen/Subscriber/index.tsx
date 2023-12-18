import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import { fetchPartnerData } from '@store/partnership/thunks';

import { trackScreen } from '@lib/analytics';
import useNotificationPermissions from '@lib/customHooks/useNotificationPermissions';

import Layout from '../Layout';
import Question from './QuestionView';

function SubscriberScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);

  useEffect(() => {
    trackScreen('SubscriberScreen');
    dispatch(fetchPartnerData(userData.id));
  }, []);

  useNotificationPermissions();

  return (
    <Layout>
      <Question
        partner={partnerData}
        text="Whats the best date you two have been on together?"
        timeRemaining="22h 6m 31s"
        user={userData}
      />
    </Layout>
  );
}

export default SubscriberScreen;
