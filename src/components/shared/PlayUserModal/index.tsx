import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import KeepAwake from 'react-native-keep-awake';
import functions from '@react-native-firebase/functions';
import RNFS from 'react-native-fs';
import base64 from 'react-native-base64';

import { trackEvent } from '@lib/analytics';
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
  ReactionIcon,
  SubTitle,
  Title,
} from './style';

const audioRecorderPlayer = new AudioRecorderPlayer();

const parseDuration = (durationString: string) => {
  const matches = durationString.match(/(\d+)m (\d+)s/);
  if (matches && matches.length === 3) {
    const minutes = parseInt(matches[1], 10);
    const seconds = parseInt(matches[2], 10);
    return (minutes * 60 + seconds) * 1000;
  }
  return 0;
};

const formatTime = (duration: number, currentPosition: number) => {
  const remainingTime = duration - currentPosition;
  if (Number.isNaN(remainingTime) || remainingTime < 0) {
    return '00m 00s';
  }

  const totalSeconds = Math.floor(remainingTime / 1000);
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
    color,
    duration,
    isUsersPartner,
    questionId,
    questionText,
    reaction,
    reactionColor,
    recordingId,
    userId,
  } = route.params as {
    audioUrl: string;
    color: string;
    duration: number;
    isUsersPartner: boolean;
    questionId: string;
    questionText: string;
    reaction: ReactionType | null;
    reactionColor: string;
    recordingId: string;
    userId: string;
  };

  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(reaction || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(duration);

  useEffect(() => {
    trackEvent('Play User Modal Seen');

    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();

      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (tempFilePath) {
        RNFS.unlink(tempFilePath)
          .then(() => {
            setTempFilePath(null);
          })
          .catch((err) => {
            trackEvent('unlink_error', {
              error: err.message,
            });

            setTempFilePath(null);
          });
      }
    };
  }, [tempFilePath]);

  const fetchAndDecryptAudio = async (url: string) => {
    try {
      const { data } = await functions().httpsCallable('getRecording')({ audioUrl: url });
      return data.audioData;
    } catch (e) {
      trackEvent('error_fetching_decryption_audio', {
        error: e.message,
      });

      throw e;
    }
  };

  const writeDecryptedDataToFile = async (decryptedData: any) => {
    const path = `${RNFS.CachesDirectoryPath}/decryptedAudio.m4a`;

    try {
      const binaryData = base64.decode(decryptedData);

      await RNFS.writeFile(path, binaryData, 'base64');
    } catch (err) {
      trackEvent('decryption_date_to_file_error', {
        error: err.message,
      });

      throw err;
    }

    setTempFilePath(`file://${path}`);
    return `file://${path}`;
  };

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

        KeepAwake.deactivate();
        trackEvent('playback_stopped');
      } else {
        let fileUri = tempFilePath;

        if (!tempFilePath) {
          const decryptedAudioData = await fetchAndDecryptAudio(audioUrl);
          fileUri = await writeDecryptedDataToFile(decryptedAudioData);
        }

        if (fileUri) {
          try {
            await audioRecorderPlayer.startPlayer(fileUri);
          } catch (e) {
            trackEvent('start_player_error', {
              error: e.message,
            });
          }
        } else {
          throw new Error('Failed to get file URI');
        }

        audioRecorderPlayer.addPlayBackListener((e: any) => {
          const time = formatTime(parseDuration(duration), e.currentPosition);
          setCurrentTime(time);

          if (e.currentPosition === e.duration) {
            audioRecorderPlayer.stopPlayer();
            setIsPlaying(false);
            setCurrentTime(duration);

            KeepAwake.deactivate();
          }
        });

        setIsPlaying(true);
        KeepAwake.activate();
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
          {isPlaying ? (
            <SubTitle>{currentTime}</SubTitle>
          ) : (
            <SubTitle>{t('questionScreen.recordScreen.note')}</SubTitle>
          )}
          <PlayBackContainer>
            {isUsersPartner && (
              <>
                <ReactionButton
                  disabled={isLoading}
                  isFaded={!!selectedReaction && selectedReaction !== ReactionType.Love}
                  isSelected={selectedReaction === ReactionType.Love}
                  onPress={() => handleReaction(ReactionType.Love)}
                  reactionColor={reactionColor}
                >
                  <ReactionIcon>❤️</ReactionIcon>
                </ReactionButton>
                <ReactionButton
                  disabled={isLoading}
                  isFaded={!!selectedReaction && selectedReaction !== ReactionType.Laugh}
                  isSelected={selectedReaction === ReactionType.Laugh}
                  onPress={() => handleReaction(ReactionType.Laugh)}
                  reactionColor={reactionColor}
                >
                  <ReactionIcon>😂</ReactionIcon>
                </ReactionButton>
              </>
            )}
            <PlayBackButton color={color} onPress={onPlayPause} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : buttonIcon}
            </PlayBackButton>
            {isUsersPartner && (
              <>
                <ReactionButton
                  disabled={isLoading}
                  isFaded={!!selectedReaction && selectedReaction !== ReactionType.Cute}
                  isSelected={selectedReaction === ReactionType.Cute}
                  onPress={() => handleReaction(ReactionType.Cute)}
                  reactionColor={reactionColor}
                >
                  <ReactionIcon>🥹</ReactionIcon>
                </ReactionButton>
                <ReactionButton
                  disabled={isLoading}
                  isFaded={!!selectedReaction && selectedReaction !== ReactionType.Fire}
                  isSelected={selectedReaction === ReactionType.Fire}
                  onPress={() => handleReaction(ReactionType.Fire)}
                  reactionColor={reactionColor}
                >
                  <ReactionIcon>🔥</ReactionIcon>
                </ReactionButton>
              </>
            )}
          </PlayBackContainer>
        </>
      )}
    </Modal>
  );
}

export default PlayUserModal;
