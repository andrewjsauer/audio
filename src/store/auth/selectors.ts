import { createSelector } from 'reselect';

export const selectUser = (state) => state.auth.user;
export const selectUserData = (state) => state.auth.userData;
export const selectCode = (state) => state.auth.code;
export const selectConfirm = (state) => state.auth.confirm;
export const selectError = (state) => state.auth.error;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectShouldResetUser = (state) => state.auth.shouldResetUser;

export const selectIsUserLoggedIn = createSelector(selectUser, (user) => !!user);

export const selectUserId = createSelector(selectUser, (user) => user?.uid);

export const selectIsUserRegistered = createSelector(
  selectUserData,
  (userData) => (!!userData && userData.isRegistered) ?? false,
);

export const selectPartnershipId = createSelector(
  selectUserData,
  (userData) => !!userData && userData.partnershipId,
);

export const selectIsPartner = createSelector(
  selectUserData,
  (userData) => (!!userData && userData.isPartner) ?? false,
);

export const selectIsSubscribed = createSelector(
  selectUserData,
  (userData) => (!!userData && userData.isSubscribed) ?? false,
);

export const selectHasSubscribed = createSelector(
  selectUserData,
  (userData) => (!!userData && userData.hasSubscribed) ?? false,
);

export const selectHasSeenPrivacyReminder = createSelector(
  selectUserData,
  (userData) => (!!userData && userData?.hasSeenPrivacyReminder) ?? false,
);
