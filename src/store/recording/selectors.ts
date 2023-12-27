import { createSelector } from 'reselect';
import { QuestionStatusType } from '@lib/types';

export const selectIsLoading = (state) => state.recording.isLoading;
export const selectUserRecording = (state) => state.recording.userRecording;
export const selectPartnerRecording = (state) => state.recording.partnerRecording;
export const selectPartnerReactionToUser = (state) => state.recording.partnerReactionToUser;
export const selectUserReactionToPartner = (state) => state.recording.userReactionToPartner;

export const selectUserRecordingStatus = createSelector(
  selectPartnerRecording,
  selectUserRecording,
  (partnerRecording, userRecording) => {
    if (!userRecording) return QuestionStatusType.Record;
    if (partnerRecording && !userRecording) return QuestionStatusType.Record;

    return QuestionStatusType.Play;
  },
);

export const selectPartnerRecordingStatus = createSelector(
  selectPartnerRecording,
  selectUserRecording,
  (partnerRecording, userRecording) => {
    if (!partnerRecording) return QuestionStatusType.PendingRecord;
    if (partnerRecording && !userRecording) return QuestionStatusType.Lock;

    return QuestionStatusType.Play;
  },
);

export const selectPartnerReactionToUserType = createSelector(
  selectPartnerReactionToUser,
  (partnerReactionToUser) => {
    if (!partnerReactionToUser) return null;

    return partnerReactionToUser.reaction;
  },
);

export const selectUserReactionToPartnerType = createSelector(
  selectUserReactionToPartner,
  (userReactionToPartner) => {
    if (!userReactionToPartner) return null;

    return userReactionToPartner.reaction;
  },
);
