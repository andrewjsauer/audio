import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { format } from 'date-fns';

import { trackEvent, trackScreen } from '@lib/analytics';
import { ReactionType } from '@lib/types';

import { saveListeningReaction } from '@store/recording/thunks';
import { AppDispatch } from '@store/index';

import PlayIcon from '@assets/icons/play.svg';
import StopIcon from '@assets/icons/stop.svg';

import Modal from '@components/shared/Modal';
import ErrorView from '@components/shared/ErrorView';

import {
  PlayBackButton,
  PlayBackContainer,
  ReactionButton,
  Timer,
  Title,
  ReactionIcon,
} from './style';

const audioRecorderPlayer = new AudioRecorderPlayer();

const formatTime = (milliseconds: number) => {
  if (Number.isNaN(milliseconds) || milliseconds < 0) {
    return '00m 00s';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
};

function PlayUserModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute();

  const {
    audioUrl,
    duration,
    isUsersPartner,
    questionText,
    recordingId,
    userId,
    questionId,
    reaction,
  } = route.params as {
    audioUrl: string;
    duration: number;
    questionText: string;
    recordingId: string;
    questionId: string;
    userId: string;
    isUsersPartner: boolean;
    reaction: ReactionType | null;
  };

  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(reaction || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(duration);

  useEffect(() => {
    trackScreen('PlayUserModal');
  }, []);

  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    };
  }, [isPlaying]);

  const onPlayPause = async () => {
    trackEvent('playback_button_clicked');
    setIsLoading(true);
    setError(null);

    try {
      if (isPlaying) {
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();

        setIsPlaying(false);
        setCurrentTime(duration);
      } else {
        await audioRecorderPlayer.startPlayer(audioUrl);
        audioRecorderPlayer.addPlayBackListener((e: any) => {
          setCurrentTime(formatTime(e.currentPosition));

          if (e.currentPosition === e.duration) {
            audioRecorderPlayer.stopPlayer();
            setIsPlaying(false);
            setCurrentTime(duration);
          }
        });
        setIsPlaying(true);
      }
    } catch (error) {
      setError(t('errors.audioPlayBackError'));

      crashlytics().recordError(error);
      trackEvent('playback_error', {
        error: error.message,
      });
    }

    setIsLoading(false);
  };

  const handleReaction = async (userSelectedReaction: ReactionType) => {
    if (selectedReaction !== userSelectedReaction) {
      trackEvent('reaction_button_clicked', {
        reaction: selectedReaction,
      });

      setSelectedReaction(userSelectedReaction);

      dispatch(
        saveListeningReaction({
          reaction: userSelectedReaction,
          userId,
          recordingId,
          listeningId: `${recordingId}-${userId}`,
          questionId,
        }),
      );
    }
  };

  const buttonIcon = isPlaying ? (
    <StopIcon width={30} height={30} />
  ) : (
    <PlayIcon width={30} height={30} />
  );

  return (
    <Modal>
      {error ? (
        <ErrorView error={error} onRetry={onPlayPause} />
      ) : (
        <>
          <Title>{questionText}</Title>
          <Timer>{currentTime}</Timer>
          <PlayBackContainer>
            <ReactionButton
              disabled={isLoading || !isUsersPartner}
              onPress={() => handleReaction(ReactionType.Love)}
              isSelected={selectedReaction === ReactionType.Love}
              isFaded={
                (!!selectedReaction && selectedReaction !== ReactionType.Love) || !isUsersPartner
              }
            >
              <ReactionIcon>❤️</ReactionIcon>
            </ReactionButton>
            <ReactionButton
              disabled={isLoading || !isUsersPartner}
              onPress={() => handleReaction(ReactionType.Laugh)}
              isSelected={selectedReaction === ReactionType.Laugh}
              isFaded={
                (!!selectedReaction && selectedReaction !== ReactionType.Laugh) || !isUsersPartner
              }
            >
              <ReactionIcon>😂</ReactionIcon>
            </ReactionButton>
            <PlayBackButton onPress={onPlayPause} type="play" disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : buttonIcon}
            </PlayBackButton>
            <ReactionButton
              disabled={isLoading || !isUsersPartner}
              onPress={() => handleReaction(ReactionType.Cute)}
              isSelected={selectedReaction === ReactionType.Cute}
              isFaded={
                (!!selectedReaction && selectedReaction !== ReactionType.Cute) || !isUsersPartner
              }
            >
              <ReactionIcon>🥹</ReactionIcon>
            </ReactionButton>
            <ReactionButton
              disabled={isLoading || !isUsersPartner}
              onPress={() => handleReaction(ReactionType.Fire)}
              isSelected={selectedReaction === ReactionType.Fire}
              isFaded={
                (!!selectedReaction && selectedReaction !== ReactionType.Fire) || !isUsersPartner
              }
            >
              <ReactionIcon>🔥</ReactionIcon>
            </ReactionButton>
          </PlayBackContainer>
        </>
      )}
    </Modal>
  );
}

export default PlayUserModal;
