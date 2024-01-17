import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment-timezone';

import LoadingView from '@components/shared/LoadingView';
import ErrorView from '@components/shared/ErrorView';
import Button from '@components/shared/Button';

import {
  HistoryScreens,
  HistoryType,
  QuestionStatusType as StatusTypes,
  ReactionTypeIcons,
} from '@lib/types';
import { trackEvent } from '@lib/analytics';

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
  FooterContainer,
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
  onEndReached,
  partnerId,
  partnerName,
  questions,
  timeZone,
  userId,
}: {
  error: string | null;
  handleRetry: () => void;
  isBlurred: boolean;
  isLoading: boolean;
  onEndReached: () => void;
  partnerId: string;
  partnerName: string;
  questions: HistoryType[];
  timeZone: string;
  userId: string;
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

  const renderFooter = () => {
    if (!questions?.length || questions.length < 10) {
      return null;
    }

    return (
      <FooterContainer>
        <Button text={t('historyScreen.buttonTextMore')} onPress={onEndReached} mode="light" />
      </FooterContainer>
    );
  };

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
      const dateInTimeZone = moment(createdAt).tz(timeZone);
      const todayInTimeZone = moment().tz(timeZone);

      isDateToday = dateInTimeZone.isSame(todayInTimeZone, 'day');
      isDatePast = dateInTimeZone.isBefore(todayInTimeZone);

      formatDate = isDateToday ? t('today') : dateInTimeZone.format('LL');
    }

    const shouldBlur = !isDateToday && isItemBlurred;
    const isPartnerButtonDisabled =
      partnerStatus !== StatusTypes.Play || (isDatePast && userStatus !== StatusTypes.Play);

    const isUserButtonDisabled =
      userStatus !== StatusTypes.Play || (isDatePast && partnerStatus !== StatusTypes.Play);

    return (
      <ItemContainer key={id}>
        <ItemQuestionContainer>
          <ItemDate>{formatDate}</ItemDate>
          {shouldBlur ? (
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
            onPress={() => {
              trackEvent('question_row_clicked', { action: 'play_partner' });
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
              });
            }}
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
            onPress={() => {
              trackEvent('question_row_clicked', { action: 'play_user' });

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
              });
            }}
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
      <FlatList
        data={questions}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        ListFooterComponent={renderFooter}
      />
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
