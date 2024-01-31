import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import functions from '@react-native-firebase/functions';
import RNFS from 'react-native-fs';

import { selectPartnershipTimeZone } from '@store/partnership/selectors';

import { UserDataType } from '@lib/types';
import { trackEvent } from '@lib/analytics';
import { formatCreatedAt } from '@lib/dateUtils';

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
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState();
      const timeZone = selectPartnershipTimeZone(state);
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
        createdAt: formatCreatedAt(data.createdAt, timeZone),
      };
    } catch (error) {
      const errorMessage = error?.toString();
      if (errorMessage && errorMessage.includes('Memory limit of')) {
        return rejectWithValue('errors.recordingSaveMemoryLimitExceeded');
      }

      trackEvent('Save Recording Failed', { error });
      return rejectWithValue('errors.recordingSaveFailed');
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

      trackEvent('Reaction Sent');
      return { reaction, questionId };
    } catch (error) {
      crashlytics().recordError(error);
      trackEvent('Save Listening Reaction Failed', {
        error: error.message,
      });
      return rejectWithValue(error);
    }
  },
);
