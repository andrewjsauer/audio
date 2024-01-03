import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import useTimeRemainingToMidnight from '@lib/customHooks/useTimeRemainingToMidnight';

import {
  UserDataType,
  QuestionStatusType,
  RecordingType,
  ModalScreens,
  ReactionType,
} from '@lib/types';

import QuestionRowView from './QuestionRow';
import { QuestionRowContainers, Container, QuestionText, TimerText } from './style';

type QuestionViewProps = {
  partner: UserDataType;
  partnerRecording: RecordingType;
  partnerStatus: QuestionStatusType;
  text: string;
  user: UserDataType;
  userRecording: RecordingType;
  userStatus: QuestionStatusType;
  partnerReactionToUser: ReactionType | null;
  userReactionToPartner: ReactionType | null;
};

function QuestionView({
  partner,
  partnerReactionToUser,
  partnerRecording,
  partnerStatus,
  text,
  user,
  userReactionToPartner,
  userRecording,
  userStatus,
}: QuestionViewProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const timeRemaining = useTimeRemainingToMidnight();

  const handleNavigation = (isPartner: boolean) => {
    if (isPartner && partnerStatus === QuestionStatusType.Play) {
      navigation.navigate(ModalScreens.PlayUserModal, {
        audioUrl: partnerRecording.audioUrl,
        color: partner.color,
        duration: partnerRecording.duration,
        isUsersPartner: true,
        questionText: text,
        reaction: userReactionToPartner,
        recordingId: partnerRecording.id,
        userId: user.id,
        reactionColor: user.color,
      });
    } else if (!isPartner) {
      if (userStatus === QuestionStatusType.Play) {
        navigation.navigate(ModalScreens.PlayUserModal, {
          audioUrl: userRecording.audioUrl,
          color: user.color,
          duration: userRecording.duration,
          isUsersPartner: false,
          questionText: text,
          reaction: partnerReactionToUser,
          reactionColor: partner.color,
          recordingId: userRecording.id,
          userId: user.id,
        });
      } else if (userStatus === QuestionStatusType.Record) {
        navigation.navigate(ModalScreens.RecordUserModal);
      }
    }
  };

  return (
    <Container>
      <TimerText>
        {t('questionScreen.subscriberScreen.timeRemaining', {
          time: timeRemaining,
        })}
      </TimerText>
      <QuestionText>{text}</QuestionText>
      <QuestionRowContainers>
        <QuestionRowView
          color={user?.color as string}
          createdAt={userRecording?.createdAt}
          key={`user_${user?.id}`}
          name={user?.name as string}
          onPress={() => handleNavigation(false)}
          status={userStatus}
          reaction={partnerReactionToUser}
          partnerColor={partner?.color as string}
        />
        <QuestionRowView
          color={partner?.color as string}
          createdAt={partnerRecording?.createdAt}
          isPartner
          key={`partner_${partner?.id}`}
          name={partner?.name as string}
          onPress={() => handleNavigation(true)}
          status={partnerStatus}
          reaction={userReactionToPartner}
          partnerColor={user?.color as string}
        />
      </QuestionRowContainers>
    </Container>
  );
}

export default QuestionView;
