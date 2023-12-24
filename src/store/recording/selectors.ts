import { createSelector } from 'reselect';
import { UserActionStatusType } from '@lib/types';

export const selectIsLoading = (state) => state.recording.isLoading;
export const selectUserRecording = (state) => state.recording.userRecording;
export const selectPartnerRecording = (state) =>
  state.recording.partnerRecording;
export const selectPartnerReactionToUser = (state) =>
  state.recording.partnerReactionToUser;
export const selectUserReactionToPartner = (state) =>
  state.recording.userReactionToPartner;

export const selectUserRecordingStatus = createSelector(
  selectPartnerRecording,
  selectUserRecording,
  (partnerRecording, userRecording) => {
    if (!userRecording) return UserActionStatusType.Record;
    if (partnerRecording && !userRecording) return UserActionStatusType.Record;

    return UserActionStatusType.Play;
  },
);

export const selectPartnerRecordingStatus = createSelector(
  selectPartnerRecording,
  selectUserRecording,
  (partnerRecording, userRecording) => {
    if (!partnerRecording) return UserActionStatusType.PendingRecord;
    if (partnerRecording && !userRecording) return UserActionStatusType.Lock;

    return UserActionStatusType.Play;
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
