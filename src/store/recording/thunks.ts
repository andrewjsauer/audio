/* eslint-disable no-underscore-dangle */
import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import RNFS from 'react-native-fs';

import { UserDataType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

type saveUserRecordingArgs = {
  recordPath: string;
  questionId: string;
  userData: UserDataType;
  partnerData: UserDataType;
  duration: string;
};

const readAudioFile = async (filePath: string) => {
  const fileContent = await RNFS.readFile(filePath, 'base64');
  return fileContent;
};

export const saveUserRecording = createAsyncThunk(
  'recording/saveUserRecording',
  async (
    { recordPath, questionId, userData, duration, partnerData }: saveUserRecordingArgs,
    { rejectWithValue },
  ) => {
    try {
      const base64Data = await readAudioFile(recordPath);

      const { data } = await functions().httpsCallable('saveRecording')({
        base64Data,
        duration,
        partnerData,
        questionId,
        userData,
      });

      return {
        ...data,
        createdAt: new Date(data.createdAt._seconds * 1000),
      };
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('save_recording_error', { error: error.message });

      return rejectWithValue(error.message);
    }
  },
);

export const saveListeningReaction = createAsyncThunk(
  'recording/saveListeningReaction',
  async (
    {
      reaction,
      recordingId,
      userId,
      listeningId,
      questionId,
    }: {
      listeningId: string;
      recordingId: string;
      userId: string;
      reaction: string;
      questionId: string;
    },
    { rejectWithValue },
  ) => {
    try {
      await firestore().collection('listenings').doc(listeningId).set(
        {
          id: listeningId,
          recordingId,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          reaction,
        },
        { merge: true },
      );

      trackEvent('listening_reaction_saved');
      return { reaction, questionId };
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('listening_reaction_save_error', {
        error: error.message,
      });
      return rejectWithValue(error);
    }
  },
);
