import React, { useState } from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';

import { UserDataType } from '@lib/types';

import { RecordStatusType as StatusTypes } from './types';
import RecordView from './RecordView';
import PlayModal from './RecordModal';

import {
  Container,
  RecordViewContainer,
  QuestionText,
  TimerText,
} from './style';

type QuestionViewProps = {
  partner: UserDataType;
  text: string;
  timeRemaining: string;
  user: UserDataType;
};

function QuestionView({
  partner,
  text,
  timeRemaining,
  user,
}: QuestionViewProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <PlayModal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      />
      <Container>
        <TimerText>
          {t('questionScreen.subscriberScreen.timeRemaining', {
            time: timeRemaining,
          })}
        </TimerText>
        <QuestionText>{text}</QuestionText>
        <RecordViewContainer>
          <RecordView
            color={user.color as string}
            name={user.name as string}
            status={StatusTypes.Play}
            createdAt={partner?.createdAt as FirebaseFirestoreTypes.Timestamp}
            onPress={() => setIsModalVisible(true)}
          />
          <RecordView
            color={partner?.color as string}
            createdAt={partner?.createdAt as FirebaseFirestoreTypes.Timestamp}
            isPartner
            name={partner?.name as string}
            status={StatusTypes.PendingRecord}
            isDisabled={!!StatusTypes.PendingRecord}
            onPress={() => setIsModalVisible(true)}
          />
        </RecordViewContainer>
      </Container>
    </>
  );
}

export default QuestionView;
