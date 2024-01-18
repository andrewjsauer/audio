import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, Vibration } from 'react-native';
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
  PermissionNotificationContainer,
  PostRecordContainer,
  RecordButton,
  RecordContainer,
  SecondaryButton,
  SecondaryButtonText,
  SubTitle,
  Title,
} from './style';

const audioRecorderPlayer = new AudioRecorderPlayer();

const MAX_RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_START = 4 * 60 * 1000 + 30 * 1000; // 4:30 minutes

function RecordUserModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const recordTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasVibratedRef = useRef<boolean>(false);

  const userData = useSelector(selectUserData);
  const partnerData = useSelector(selectPartnerData);
  const currentQuestion = useSelector(selectCurrentQuestion);
  const isLoading = useSelector(selectIsLoading);
  const userRecording = useSelector(selectUserRecording);

  const [recordTime, setRecordTime] = useState('00m 00s');
  const [maxRecordTime, setMaxRecordTime] = useState('');
  const [recordPath, setRecordPath] = useState('');
  const [isCountdown, setIsCountdown] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { isPermissionGranted, handlePermissionPress } = useAudioRecordingPermission();

  useEffect(() => {
    if (userRecording) {
      trackEvent('question_recorded', { question_id: currentQuestion.id });
      setTimeout(() => navigation.goBack(), 0);
    }
  }, [userRecording]);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();

      if (recordTimeoutRef.current) {
        clearTimeout(recordTimeoutRef.current);
        recordTimeoutRef.current = null;
      }

      setIsCountdown(false);
      setIsRecording(false);
      setIsPlaying(false);
      setRecordTime('00m 00s');
      setRecordPath('');
      hasVibratedRef.current = false;
      KeepAwake.deactivate();
    };
  }, []);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${paddedMinutes}m ${paddedSeconds}s`;
  };

  const formatRecordTime = (milliseconds: number) => {
    if (milliseconds >= COUNTDOWN_START) {
      const countdownMilliseconds = MAX_RECORDING_DURATION - milliseconds;
      const countdownSeconds = Math.floor(countdownMilliseconds / 1000);

      setIsCountdown(true);
      return t('questionScreen.recordScreen.timeRunningOut', { time: countdownSeconds });
    }

    setIsCountdown(false);
    return formatTime(milliseconds);
  };

  const onStopRecord = async () => {
    trackEvent('question_record_stopped', { question_id: currentQuestion.id });

    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();

    setRecordPath(result);
    KeepAwake.deactivate();
    setIsRecording(false);
    hasVibratedRef.current = false;

    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
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
      if (e.currentPosition >= MAX_RECORDING_DURATION) {
        trackEvent('question_record_max_duration_reached', { question_id: currentQuestion.id });

        setMaxRecordTime(formatTime(e.currentPosition));
        onStopRecord();
        return;
      }

      if (
        e.currentPosition >= COUNTDOWN_START &&
        e.currentPosition < COUNTDOWN_START + 1000 &&
        !hasVibratedRef.current
      ) {
        trackEvent('question_record_countdown_started', { question_id: currentQuestion.id });
        Vibration.vibrate([500, 500, 500]);
        hasVibratedRef.current = true;
      }

      setRecordTime(formatRecordTime(e.currentPosition));
      setMaxRecordTime(formatTime(e.currentPosition));
    });

    KeepAwake.activate();
    setIsRecording(true);

    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
    }

    recordTimeoutRef.current = setTimeout(() => {
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

    setIsCountdown(false);
    setRecordTime('00m 00s');
    setRecordPath('');
    hasVibratedRef.current = false;
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
    setIsCountdown(false);
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
        <RecordButton onPress={handleRecordPress} disabled={!isPermissionGranted} type="red">
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
        <RecordButton onPress={handlePlayPress} type="turquoise" disabled={isLoading}>
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
      {isRecording || isPlaying ? (
        <SubTitle isWarningColor={isCountdown}>{recordTime}</SubTitle>
      ) : (
        <SubTitle>{t('questionScreen.recordScreen.note')}</SubTitle>
      )}
      {recordContent}
      {buttonContent}
    </Modal>
  );
}

export default RecordUserModal;
