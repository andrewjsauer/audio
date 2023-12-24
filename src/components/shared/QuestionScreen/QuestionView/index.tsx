import React from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import {
  UserDataType,
  UserActionStatusType,
  RecordingType,
  ModalScreens,
  ReactionType,
} from '@lib/types';

import UserActionView from './UserActionView';

import { ActionViewContainer, Container, QuestionText, TimerText } from './style';

type QuestionViewProps = {
  partner: UserDataType;
  partnerRecording: RecordingType;
  partnerStatus: UserActionStatusType;
  text: string;
  timeRemaining: string;
  user: UserDataType;
  userRecording: RecordingType;
  userStatus: UserActionStatusType;
  partnerReactionToUser: ReactionType | null;
  userReactionToPartner: ReactionType | null;
};

function QuestionView({
  partner,
  partnerReactionToUser,
  partnerRecording,
  partnerStatus,
  text,
  timeRemaining,
  user,
  userReactionToPartner,
  userRecording,
  userStatus,
}: QuestionViewProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleNavigation = (isPartner: boolean) => {
    if (isPartner && partnerStatus === UserActionStatusType.Play) {
      navigation.navigate(ModalScreens.PlayUserModal, {
        audioUrl: partnerRecording.audioUrl,
        duration: partnerRecording.duration,
        isUsersPartner: true,
        questionText: text,
        recordingId: partnerRecording.id,
        userId: user.id,
        reaction: userReactionToPartner,
      });
    } else if (!isPartner) {
      if (userStatus === UserActionStatusType.Play) {
        navigation.navigate(ModalScreens.PlayUserModal, {
          audioUrl: userRecording.audioUrl,
          duration: userRecording.duration,
          isUsersPartner: false,
          questionText: text,
          recordingId: userRecording.id,
          userId: user.id,
          reaction: partnerReactionToUser,
        });
      } else if (userStatus === UserActionStatusType.Record) {
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
      <ActionViewContainer>
        <UserActionView
          color={user?.color as string}
          createdAt={userRecording?.createdAt as FirebaseFirestoreTypes.Timestamp}
          key={`user_${user?.id}`}
          name={user?.name as string}
          onPress={() => handleNavigation(false)}
          status={userStatus}
          reaction={partnerReactionToUser}
          partnerColor={partner?.color as string}
        />
        <UserActionView
          color={partner?.color as string}
          createdAt={partnerRecording?.createdAt as FirebaseFirestoreTypes.Timestamp}
          isPartner
          key={`partner_${partner?.id}`}
          name={partner?.name as string}
          onPress={() => handleNavigation(true)}
          status={partnerStatus}
          reaction={userReactionToPartner}
          partnerColor={user?.color as string}
        />
      </ActionViewContainer>
    </Container>
  );
}

export default QuestionView;
