import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';

import AudioRecorderPlayer, {
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData } from '@store/partnership/selectors';
import { selectCurrentQuestion } from '@store/question/selectors';
import { selectUserRecording, selectIsLoading } from '@store/recording/selectors';
import { AppDispatch } from '@store/index';

import { saveUserRecording } from '@store/recording/thunks';

import useAudioRecordingPermission from '@lib/customHooks/useAudioRecordingPermission';

import MicIcon from '@assets/icons/mic.svg';
import PlayIcon from '@assets/icons/play.svg';
import StopIcon from '@assets/icons/stop.svg';

import Modal from '@components/shared/Modal';
import { trackEvent } from '@lib/analytics';

import PermissionNotification from './PermissionNotification';
import {
  RecordButton,
  SecondaryButton,
  SecondaryButtonText,
  RecordContainer,
  Title,
  Timer,
  PermissionNotificationContainer,
  PostRecordContainer,
} from './style';

const audioRecorderPlayer = new AudioRecorderPlayer();
const MAX_RECORDING_DURATION = 10 * 60 * 1000; // 10 minutes

function RecordUserModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const isLoading = useSelector(selectIsLoading);
  const userRecording = useSelector(selectUserRecording);

  const [recordTime, setRecordTime] = useState('00m 00s');
  const [maxRecordTime, setMaxRecordTime] = useState('');
  const [recordPath, setRecordPath] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { isPermissionGranted, handlePermissionPress } = useAudioRecordingPermission();

  useEffect(() => {
    if (userRecording) {
      trackEvent('question_recorded', { question_id: currentQuestion.id });
      navigation.goBack();
    }
  }, [userRecording]);

  useEffect(() => {
    return () => {
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
      }

      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
      setIsRecording(false);
      setIsPlaying(false);
      setRecordTime('00m 00s');
      setRecordPath('');
      KeepAwake.deactivate();
    };
  }, []);

  const formatRecordTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${paddedMinutes}m ${paddedSeconds}s`;
  };

  const onStopRecord = async () => {
    trackEvent('question_record_stopped', { question_id: currentQuestion.id });

    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();

    setRecordPath(result);
    KeepAwake.deactivate();
    setIsRecording(false);
  };

  const onStartRecord = async () => {
    trackEvent('question_record_started', { question_id: currentQuestion.id });

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    await audioRecorderPlayer.startRecorder(undefined, audioSet);

    audioRecorderPlayer.addRecordBackListener((e: any) => {
      setRecordTime(formatRecordTime(e.currentPosition));
      setMaxRecordTime(formatRecordTime(e.currentPosition));
      // Update visualizer here
    });

    KeepAwake.activate();
    setIsRecording(true);

    setTimeout(() => {
      if (isRecording) {
        onStopRecord();
      }
    }, MAX_RECORDING_DURATION);
  };

  const onRedo = async () => {
    if (isPlaying) {
      trackEvent('question_record_redo', { question_id: currentQuestion.id });

      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    }

    setRecordTime('00m 00s');
    setRecordPath('');
  };

  const onPlayBack = async () => {
    if (!recordPath) return;
    trackEvent('question_record_playback', { question_id: currentQuestion.id });
    setIsPlaying(true);

    await audioRecorderPlayer.startPlayer(recordPath);
    audioRecorderPlayer.addPlayBackListener((e: any) => {
      setRecordTime(formatRecordTime(e.currentPosition));

      if (e.currentPosition === e.duration) {
        audioRecorderPlayer.stopPlayer();
        setIsPlaying(false);
      }
    });
  };

  const onStopPlay = async () => {
    trackEvent('question_record_playback_stopped', { question_id: currentQuestion.id });

    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();

    setIsPlaying(false);
    setRecordTime(maxRecordTime);
  };

  const onSubmit = async () => {
    if (isPlaying) {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setRecordTime(maxRecordTime);
    }

    if (recordPath) {
      dispatch(
        saveUserRecording({
          duration: maxRecordTime,
          questionId: currentQuestion.id,
          recordPath,
          userData,
          partnerData,
        }),
      );
    }
  };

  const handlePlayPress = () => {
    if (isPlaying) {
      trackEvent('question_record_stop_play', { question_id: currentQuestion.id });
      onStopPlay();
    } else {
      trackEvent('question_record_play_back', { question_id: currentQuestion.id });
      onPlayBack();
    }
  };

  const handleRecordPress = () => {
    if (isRecording) {
      trackEvent('question_record_stop', { question_id: currentQuestion.id });
      onStopRecord();
    } else {
      trackEvent('question_record_start', { question_id: currentQuestion.id });
      onStartRecord();
    }
  };

  let recordContent = null;
  if (!isPermissionGranted) {
    recordContent = (
      <PermissionNotificationContainer>
        <PermissionNotification onPermissionPress={handlePermissionPress} />
      </PermissionNotificationContainer>
    );
  }

  let buttonContent = null;
  if (!recordPath) {
    buttonContent = (
      <RecordContainer>
        <RecordButton onPress={handleRecordPress} disabled={!isPermissionGranted} type="record">
          {isRecording ? <StopIcon width={30} height={30} /> : <MicIcon width={30} height={30} />}
        </RecordButton>
      </RecordContainer>
    );
  } else {
    const buttonIcon = isPlaying ? (
      <StopIcon width={30} height={30} />
    ) : (
      <PlayIcon width={30} height={30} />
    );

    buttonContent = (
      <PostRecordContainer>
        <SecondaryButton type="redo" onPress={onRedo} disabled={isLoading}>
          <SecondaryButtonText type="redo">
            {t('questionScreen.subscriberScreen.redo')}
          </SecondaryButtonText>
        </SecondaryButton>
        <RecordButton onPress={handlePlayPress} type="play" disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : buttonIcon}
        </RecordButton>
        <SecondaryButton type="submit" onPress={onSubmit} disabled={isLoading}>
          <SecondaryButtonText type="submit">
            {t('questionScreen.subscriberScreen.submit')}
          </SecondaryButtonText>
        </SecondaryButton>
      </PostRecordContainer>
    );
  }

  return (
    <Modal>
      <Title>{currentQuestion.text}</Title>
      <Timer>{recordTime}</Timer>
      {recordContent}
      {buttonContent}
    </Modal>
  );
}

export default RecordUserModal;
