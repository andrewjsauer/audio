import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { trackEvent } from '@lib/analytics';
import { QuestionStatusType } from '@lib/types';

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
    trackEvent('Non Subscriber Screen Seen');
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
            createdAt: new Date(),
            partnershipId: 'partnershipId',
            audioUrl: '',
            duration: '10',
          }}
          partnerStatus={QuestionStatusType.PendingRecord}
          text={t('questionScreen.nonSubscriberScreen.default.text')}
          user={userData}
          userReactionToPartner={null}
          userRecording={{
            userId: 'userId',
            createdAt: new Date(),
            partnershipId: 'partnershipId',
            audioUrl: '',
            duration: '10',
            id: 'userRecordingId',
          }}
          userStatus={QuestionStatusType.PendingRecord}
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
