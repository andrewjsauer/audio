import { createSelector } from 'reselect';

export const selectUser = (state) => state.auth.user;
export const selectUserData = (state) => state.auth.userData;
export const selectCode = (state) => state.auth.code;
export const selectConfirm = (state) => state.auth.confirm;
export const selectError = (state) => state.auth.error;
export const selectIsLoading = (state) => state.auth.isLoading;

export const selectIsUserLoggedIn = createSelector(
  selectUser,
  (user) => !!user,
);

export const selectIsUserRegistered = createSelector(
  selectUserData,
  (userData) => !!userData && !!userData.isRegistered,
);

export const selectUserId = createSelector(selectUserData, (user) => user?.id);
