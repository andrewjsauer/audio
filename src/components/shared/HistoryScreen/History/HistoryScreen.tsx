import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, isToday } from 'date-fns';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';

import {
  HistoryScreens,
  HistoryType,
  QuestionStatusType as StatusTypes,
  ReactionTypeIcons,
} from '@lib/types';

import PlayIcon from '@assets/icons/play.svg';
import QuestionIcon from '@assets/icons/help.svg';
import LockIcon from '@assets/icons/lock.svg';
import MicIcon from '@assets/icons/mic.svg';

import {
  BlurredBackground,
  Container,
  IconButton,
  ItemContainer,
  ItemDate,
  ItemIconContainer,
  ItemQuestionContainer,
  ItemQuestionStatusText,
  ItemQuestionText,
  NoResultsContainer,
  NoResultsText,
  ReactionOrb,
  ReactionIcon,
} from './style';

const statusIcons = {
  [StatusTypes.Lock]: {
    icon: LockIcon,
  },
  [StatusTypes.PendingRecord]: {
    icon: QuestionIcon,
  },
  [StatusTypes.Play]: {
    icon: PlayIcon,
  },
  [StatusTypes.Record]: {
    icon: MicIcon,
  },
};

function HistoryScreen({
  error,
  handleRetry,
  isBlurred,
  isLoading,
  partnerId,
  partnerName,
  questions,
  userId,
}: {
  error: string | null;
  handleRetry: () => void;
  isBlurred: boolean;
  isLoading: boolean;
  partnerName: string;
  questions: HistoryType[];
  userId: string;
  partnerId: string;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (isLoading) {
    return (
      <Container>
        <LoadingView />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorView onRetry={handleRetry} error={error} />
      </Container>
    );
  }

  if (!questions?.length) {
    return (
      <Container>
        <NoResultsContainer>
          <NoResultsText>{t('historyScreen.noResults')}</NoResultsText>
        </NoResultsContainer>
      </Container>
    );
  }

  const renderHistoryItem = ({
    item: {
      createdAt,
      id,
      partnerAudioUrl,
      partnerColor,
      partnerDuration,
      partnerReactionToUser,
      partnerRecordingId,
      partnershipTextKey,
      partnerStatus,
      text,
      userAudioUrl,
      userColor,
      userDuration,
      userReactionToPartner,
      userRecordingId,
      userStatus,
    },
  }: {
    item: HistoryType;
  }) => {
    const { icon: UserIcon } = statusIcons[userStatus];
    const { icon: PartnerIcon } = statusIcons[partnerStatus];

    let formatDate = '';
    if (createdAt) {
      formatDate = isToday(new Date(createdAt)) ? t('today') : format(new Date(createdAt), 'PP');
    }

    return (
      <ItemContainer key={id}>
        <ItemQuestionContainer>
          <ItemDate>{formatDate}</ItemDate>
          <ItemQuestionText numberOfLines={2} ellipsizeMode="tail">
            {text}
          </ItemQuestionText>
          <ItemQuestionStatusText>
            {t(`historyScreen.status.${partnershipTextKey}`, {
              name: partnerName,
            })}
          </ItemQuestionStatusText>
        </ItemQuestionContainer>
        <ItemIconContainer>
          <IconButton
            color={partnerColor}
            disabled={
              partnerStatus === StatusTypes.PendingRecord || partnerStatus === StatusTypes.Lock
            }
            onPress={() =>
              navigation.navigate(HistoryScreens.PlayUserModal, {
                audioUrl: partnerAudioUrl,
                color: partnerColor,
                duration: partnerDuration,
                isUsersPartner: true,
                questionId: id,
                questionText: text,
                reaction: userReactionToPartner,
                reactionColor: userColor,
                recordingId: partnerRecordingId,
                userId,
              })
            }
          >
            <PartnerIcon width={18} height={18} />
            {userReactionToPartner && (
              <ReactionOrb color={userColor}>
                <ReactionIcon>{ReactionTypeIcons[userReactionToPartner]}</ReactionIcon>
              </ReactionOrb>
            )}
          </IconButton>
          <IconButton
            color={userColor}
            disabled={userStatus === StatusTypes.PendingRecord || userStatus === StatusTypes.Lock}
            onPress={() =>
              navigation.navigate(HistoryScreens.PlayUserModal, {
                audioUrl: userAudioUrl,
                color: userColor,
                duration: userDuration,
                isUsersPartner: false,
                questionId: id,
                questionText: text,
                reaction: partnerReactionToUser,
                reactionColor: partnerColor,
                recordingId: userRecordingId,
                userId: partnerId,
              })
            }
          >
            <UserIcon width={18} height={18} />
            {partnerReactionToUser && (
              <ReactionOrb color={partnerColor}>
                <ReactionIcon>{ReactionTypeIcons[partnerReactionToUser]}</ReactionIcon>
              </ReactionOrb>
            )}
          </IconButton>
        </ItemIconContainer>
      </ItemContainer>
    );
  };

  return (
    <Container>
      <FlatList data={questions} renderItem={renderHistoryItem} keyExtractor={(item) => item.id} />
      {isBlurred && (
        <BlurredBackground
          blurType="light"
          blurAmount={8}
          reducedTransparencyFallbackColor="white"
        />
      )}
    </Container>
  );
}

export default HistoryScreen;
