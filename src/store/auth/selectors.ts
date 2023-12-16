import { createSelector } from 'reselect';

export const selectUser = (state) => state.auth.user;
export const selectUserData = (state) => state.auth.userData;
export const selectCode = (state) => state.auth.code;
export const selectConfirm = (state) => state.auth.confirm;
export const selectError = (state) => state.auth.error;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsSubscriber = (state) => state.auth.isSubscriber;

export const selectIsUserLoggedIn = createSelector(
  selectUser,
  (user) => !!user,
);

export const selectUserId = createSelector(selectUser, (user) => user?.uid);

export const selectIsUserRegistered = createSelector(
  selectUserData,
  (userData) => !!userData && !!userData.isRegistered,
);
