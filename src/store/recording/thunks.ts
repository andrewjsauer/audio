import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';

import { UserDataType } from '@lib/types';
import { trackEvent } from '@lib/analytics';

type saveUserRecordingArgs = {
  recordPath: string;
  questionId: string;
  userData: UserDataType;
  partnerData: UserDataType;
  duration: string;
};

export const saveUserRecording = createAsyncThunk(
  'recording/saveUserRecording',
  async ({ recordPath, questionId, userData, duration, partnerData }: saveUserRecordingArgs, { rejectWithValue }) => {
    try {
      const { id: userId, partnershipId } = userData;
      const recordingId = `${userId}_${questionId}`;

      const storageRef = storage().ref(`/recordings/${recordingId}.mp4`);

      const blob = await fetch(recordPath).then((res) => res.blob());
      const uploadTask = storageRef.put(blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            crashlytics().recordError(error);
            trackEvent('upload_recording_error', { error: error.message });
            reject(rejectWithValue(error.message));
          },
          async () => {
            try {
              const audioUrl = await uploadTask.snapshot.ref.getDownloadURL();
              const recordingData = {
                id: recordingId,
                userId,
                questionId,
                createdAt: firestore.FieldValue.serverTimestamp(),
                duration,
                audioUrl,
                partnershipId,
                didLikeQuestion: null,
                feedbackText: null,
                reaction: [],
              };

              await firestore().collection('recordings').doc(recordingId).set(recordingData, { merge: true });

              if (partnerData.deviceIds?.length) {
                await functions().httpsCallable('sendNotification')({
                  tokens: partnerData.deviceIds,
                  title: `${userData.name} recorded todays question!`,
                  body: 'Tap to listen to their answer.',
                });
              } else {
                await functions().httpsCallable('sendSMS')({
                  phoneNumber: partnerData.phoneNumber,
                  message: `${userData.name} recorded todays question!`,
                });
              }

              resolve(recordingData);
            } catch (error) {
              crashlytics().recordError(error);
              trackEvent('save_recording_error', { error: error.message });
              reject(rejectWithValue(error.message));
            }
          },
        );
      });
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
