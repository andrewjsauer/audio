import React from 'react';

import { UserDataType } from '@lib/types';

import { RecordStatusType as StatusTypes } from './types';
import RecordView from './RecordView';
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
  return (
    <Container>
      <TimerText>{timeRemaining} remaining...</TimerText>
      <QuestionText>{text}</QuestionText>
      <RecordViewContainer>
        <RecordView
          color={user.color as string}
          name={user.name as string}
          status={StatusTypes.NotRecorded}
          createdAt={new Date()}
        />
        <RecordView
          color={partner.color as string}
          createdAt={new Date()}
          isPartner
          name={partner.name as string}
          status={StatusTypes.NotRecorded}
        />
      </RecordViewContainer>
    </Container>
  );
}

export default QuestionView;
