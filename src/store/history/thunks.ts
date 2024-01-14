import { createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics';

import { RecordingType, QuestionStatusType } from '@lib/types';
import { trackEvent } from '@lib/analytics';
import { formatCreatedAt } from '@lib/dateUtils';

import { showNotification } from '@store/ui/slice';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnerData, selectPartnershipTimeZone } from '@store/partnership/selectors';
import { selectLastDocSnapshot } from './selectors';

async function getRecordingData(recordings: RecordingType[], userId: string, partnerId: string) {
  const userRecording = recordings.find((rec) => rec.userId === userId);
  const partnerRecording = recordings.find((rec) => rec.userId === partnerId);

  const fetchReaction = async (id: string, recordingId: string) => {
    try {
      const listeningSnapshot = await firestore()
        .collection('listenings')
        .where('userId', '==', id)
        .where('recordingId', '==', recordingId)
        .get();

      return listeningSnapshot.empty ? null : listeningSnapshot.docs[0].data().reaction;
    } catch (error) {
      trackEvent('fetch_reaction_error', { error: error.message });
      crashlytics().recordError(error);
      return null;
    }
  };

  if (userRecording && partnerRecording) {
    const partnerReactionToUser = await fetchReaction(partnerId, userRecording.id);
    const userReactionToPartner = await fetchReaction(userId, partnerRecording.id);

    return {
      partnerAudioUrl: partnerRecording.audioUrl,
      partnerDuration: partnerRecording.duration,
      partnerReactionToUser,
      partnerRecordingId: partnerRecording.id,
      partnershipTextKey: 'bothAnswered',
      partnerStatus: QuestionStatusType.Play,
      userAudioUrl: userRecording.audioUrl,
      userDuration: userRecording.duration,
      userReactionToPartner,
      userRecordingId: userRecording.id,
      userStatus: QuestionStatusType.Play,
    };
  }

  if (partnerRecording) {
    const userReactionToPartner = await fetchReaction(userId, partnerRecording.id);

    return {
      partnerAudioUrl: partnerRecording.audioUrl,
      partnerDuration: partnerRecording.duration,
      partnerReactionToUser: null,
      partnerRecordingId: partnerRecording.id,
      partnershipTextKey: 'partnerAnswered',
      partnerStatus: QuestionStatusType.Lock,
      userAudioUrl: null,
      userDuration: null,
      userReaction: null,
      userReactionToPartner,
      userRecordingId: null,
      userStatus: QuestionStatusType.PendingRecord,
    };
  }

  if (userRecording) {
    const partnerReactionToUser = await fetchReaction(partnerId, userRecording.id);

    return {
      partnerAudioUrl: null,
      partnerDuration: null,
      partnerRecordingId: null,
      partnershipTextKey: 'userAnswered',
      partnerStatus: QuestionStatusType.PendingRecord,
      userAudioUrl: userRecording.audioUrl,
      userDuration: userRecording.duration,
      userRecordingId: userRecording.id,
      userStatus: QuestionStatusType.Play,
      partnerReactionToUser,
      userReactionToPartner: null,
    };
  }

  return {
    partnerAudioUrl: null,
    partnerDuration: null,
    partnerReactionToUser: null,
    partnerRecordingId: null,
    partnershipTextKey: 'bothDidNotAnswer',
    partnerStatus: QuestionStatusType.PendingRecord,
    userAudioUrl: null,
    userDuration: null,
    userReactionToPartner: null,
    userRecordingId: null,
    userStatus: QuestionStatusType.PendingRecord,
  };
}

export const fetchHistoryData = createAsyncThunk(
  'history/fetchHistoryData',
  async (_, { rejectWithValue, getState }) => {
    const state = getState();

    const userData = selectUserData(state);
    const partnerData = selectPartnerData(state);
    const timeZone = selectPartnershipTimeZone(state);

    try {
      const { partnershipId } = userData;

      const questionsSnapshot = await firestore()
        .collection('questions')
        .where('partnershipId', '==', partnershipId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      if (questionsSnapshot.empty) {
        trackEvent('history_not_found');
        return rejectWithValue('No history data found');
      }

      const questions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const historyData = await Promise.all(
        questions.map(async (question) => {
          const recordingsSnapshot = await firestore()
            .collection('recordings')
            .where('questionId', '==', question.id)
            .get();

          const recordings = recordingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const {
            partnerAudioUrl,
            partnerDuration,
            partnerReactionToUser,
            partnerRecordingId,
            partnershipTextKey,
            partnerStatus,
            userAudioUrl,
            userDuration,
            userReactionToPartner,
            userRecordingId,
            userStatus,
          } = await getRecordingData(recordings, userData.id, partnerData.id);

          return {
            createdAt: formatCreatedAt(question.createdAt, timeZone),
            id: `${question.id}_${userData.id}`,
            partnerAudioUrl,
            partnerColor: partnerData.color,
            partnerDuration,
            partnerReactionToUser,
            partnerRecordingId,
            partnershipTextKey,
            partnerStatus,
            questionId: question.id,
            text: question.text,
            userAudioUrl,
            userColor: userData.color,
            userDuration,
            userReactionToPartner,
            userRecordingId,
            userStatus,
          };
        }),
      );

      trackEvent('history_fetched');
      const lastDoc = questionsSnapshot.docs[questionsSnapshot.docs.length - 1];
      const lastDocData = lastDoc.exists ? { id: lastDoc.id, ...lastDoc.data() } : null;

      return { questions: historyData, lastDocSnapshot: lastDocData };
    } catch (error) {
      trackEvent('history_fetch_error', { error: error.message });
      crashlytics().recordError(error);
      return rejectWithValue(error);
    }
  },
);

export const fetchMoreHistoryData = createAsyncThunk(
  'history/fetchMoreHistoryData',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const userData = selectUserData(state);
      const lastDocSnapshot = selectLastDocSnapshot(state);
      const partnerData = selectPartnerData(state);
      const timeZone = selectPartnershipTimeZone(state);

      if (!lastDocSnapshot) {
        trackEvent('last_doc_snapshot_not_found');
        return {
          questions: [],
          lastDocSnapshot: null,
        };
      }

      const questionsSnapshot = await firestore()
        .collection('questions')
        .where('partnershipId', '==', userData.partnershipId)
        .orderBy('createdAt', 'desc')
        .startAfter(lastDocSnapshot)
        .limit(10)
        .get();

      if (questionsSnapshot.empty) {
        trackEvent('more_history_not_found');
        dispatch(
          showNotification({
            title: 'historyScreen.noMoreResults.title',
            description: 'historyScreen.noMoreResults.description',
            type: 'success',
          }),
        );

        return {
          questions: [],
          lastDocSnapshot: null,
        };
      }

      const questions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const moreHistoryData = await Promise.all(
        questions.map(async (question) => {
          const recordingsSnapshot = await firestore()
            .collection('recordings')
            .where('questionId', '==', question.id)
            .get();

          const recordings = recordingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const {
            partnerAudioUrl,
            partnerDuration,
            partnerReactionToUser,
            partnerRecordingId,
            partnershipTextKey,
            partnerStatus,
            userAudioUrl,
            userDuration,
            userReactionToPartner,
            userRecordingId,
            userStatus,
          } = await getRecordingData(recordings, userData.id, question.partnerId);

          return {
            createdAt: formatCreatedAt(question.createdAt, timeZone),
            id: `${question.id}_${userData.id}`,
            partnerAudioUrl,
            partnerColor: partnerData.color,
            partnerDuration,
            partnerReactionToUser,
            partnerRecordingId,
            partnershipTextKey,
            partnerStatus,
            questionId: question.id,
            text: question.text,
            userAudioUrl,
            userColor: userData.color,
            userDuration,
            userReactionToPartner,
            userRecordingId,
            userStatus,
          };
        }),
      );

      trackEvent('more_history_fetched');

      const lastDoc = questionsSnapshot.docs[questionsSnapshot.docs.length - 1];
      const lastDocData = lastDoc.exists ? { id: lastDoc.id, ...lastDoc.data() } : null;

      return { questions: moreHistoryData, lastDocSnapshot: lastDocData };
    } catch (error) {
      trackEvent('history_fetch_more_history_data_error', { error: error.message });
      crashlytics().recordError(error);
      return rejectWithValue(error.message);
    }
  },
);
