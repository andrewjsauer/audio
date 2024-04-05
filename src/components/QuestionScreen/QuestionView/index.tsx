import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { selectPartnershipTimeZone } from '@store/partnership/selectors';
import { selectAreBothRecordingsAvailable } from '@store/recording/selectors';

import { trackEvent } from '@lib/analytics';
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

  const timeZone = useSelector(selectPartnershipTimeZone);
  const areBothRecordingsAvailable = useSelector(selectAreBothRecordingsAvailable);

  const { time, relationshipTimeZone, localTimeZone } = useTimeRemainingToMidnight(timeZone);

  const handleNavigation = (isPartner: boolean) => {
    if (isPartner && partnerStatus === QuestionStatusType.Play) {
      trackEvent('Play Partner Button Tapped', { action: 'play_partner' });
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
      trackEvent('Play User Button Tapped', { action: 'play_user' });
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
        trackEvent('Record Answer Button Tapped', { action: 'record_user' });
        navigation.navigate(ModalScreens.RecordUserModal);
      }
    }
  };

  return (
    <Container>
      {areBothRecordingsAvailable && time ? (
        <TimerText>{t('questionScreen.subscriberScreen.timeRemaining', { time })}</TimerText>
      ) : (
        <TimerText> </TimerText>
      )}
      {areBothRecordingsAvailable && relationshipTimeZone !== localTimeZone && (
        <TimerText>
          {t('questionScreen.subscriberScreen.timeRemainingExplained', {
            timeZone: relationshipTimeZone,
          })}
        </TimerText>
      )}
      <QuestionText>{text}</QuestionText>
      <QuestionRowContainers>
        <QuestionRowView
          color={user?.color as string}
          createdAt={userRecording?.createdAt}
          key={`user_${user?.id}`}
          name={user?.name as string}
          onPress={() => handleNavigation(false)}
          partnerColor={partner?.color as string}
          reaction={partnerReactionToUser}
          status={userStatus}
          timeZone={timeZone}
        />
        <QuestionRowView
          color={partner?.color as string}
          createdAt={partnerRecording?.createdAt}
          isPartner
          key={`partner_${partner?.id}`}
          name={partner?.name as string}
          onPress={() => handleNavigation(true)}
          partnerColor={user?.color as string}
          reaction={userReactionToPartner}
          status={partnerStatus}
          timeZone={timeZone}
        />
      </QuestionRowContainers>
    </Container>
  );
}

export default QuestionView;
