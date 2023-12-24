import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import firestore from '@react-native-firebase/firestore';

import { trackScreen } from '@lib/analytics';
import { UserActionStatusType } from '@lib/types';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';

import NonSubscriberNotification from '@components/shared/NonSubscriberNotification';

import Layout from '../Layout';
import Question from '../QuestionView';
import { QuestionContainer, BlurredBackground } from './style';

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
      <QuestionContainer>
        <Question
          partner={partnerData}
          partnerReactionToUser={null}
          partnerRecording={{
            id: 'partnerRecordingId',
            userId: 'partnerId',
            createdAt: firestore.FieldValue.serverTimestamp(),
            partnershipId: 'partnershipId',
            audioUrl: '',
            duration: '10',
          }}
          partnerStatus={UserActionStatusType.PendingRecord}
          text={t('questionScreen.nonSubscriberScreen.default.text')}
          timeRemaining="22h 6m 31s"
          user={userData}
          userReactionToPartner={null}
          userRecording={{
            userId: 'userId',
            createdAt: firestore.FieldValue.serverTimestamp(),
            partnershipId: 'partnershipId',
            audioUrl: '',
            duration: '10',
            id: 'userRecordingId',
          }}
          userStatus={UserActionStatusType.PendingRecord}
        />
        <BlurredBackground
          blurType="light"
          blurAmount={8}
          reducedTransparencyFallbackColor="white"
        />
      </QuestionContainer>
    </Layout>
  );
}

export default NonSubscribedScreen;
