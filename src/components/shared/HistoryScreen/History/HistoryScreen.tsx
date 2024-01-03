import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, isToday, isBefore } from 'date-fns';

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
  BlurredItemRow,
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
      isItemBlurred = false,
    },
  }: {
    item: HistoryType;
  }) => {
    const { icon: UserIcon } = statusIcons[userStatus];
    const { icon: PartnerIcon } = statusIcons[partnerStatus];

    let formatDate = '';
    let isDateToday = false;
    let isDatePast = false;

    if (createdAt) {
      isDateToday = isToday(new Date(createdAt));
      isDatePast = isBefore(new Date(createdAt), new Date());

      formatDate = isDateToday ? t('today') : format(new Date(createdAt), 'PP');
    }

    const shouldBlurr = !isDateToday && isItemBlurred;
    const isPartnerButtonDisabled =
      partnerStatus !== StatusTypes.Play || (isDatePast && userStatus !== StatusTypes.Play);

    const isUserButtonDisabled =
      userStatus !== StatusTypes.Play || (isDatePast && partnerStatus !== StatusTypes.Play);

    return (
      <ItemContainer key={id}>
        <ItemQuestionContainer>
          <ItemDate>{formatDate}</ItemDate>
          {shouldBlurr ? (
            <View>
              <BlurredItemRow
                blurType="light"
                blurAmount={5}
                reducedTransparencyFallbackColor="white"
              />
              <ItemQuestionText numberOfLines={2} ellipsizeMode="tail">
                {text}
              </ItemQuestionText>
            </View>
          ) : (
            <ItemQuestionText numberOfLines={2} ellipsizeMode="tail">
              {text}
            </ItemQuestionText>
          )}
          <ItemQuestionStatusText>
            {t(`historyScreen.status.${partnershipTextKey}`, {
              name: partnerName,
            })}
          </ItemQuestionStatusText>
        </ItemQuestionContainer>
        <ItemIconContainer>
          <IconButton
            color={partnerColor}
            disabled={isPartnerButtonDisabled}
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
            disabled={isUserButtonDisabled}
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
