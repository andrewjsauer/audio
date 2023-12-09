import { createSelector } from 'reselect';

export const selectIsLoading = (state: any) => state.app.isLoading;
export const selectError = (state: any) => state.app.error;
export const selectUser = (state: any) => state.app.user;
export const selectUserData = (state: any) => state.app.userData;
export const selectPartnersData = (state: any) => state.app.partnersData;

export const selectIsUserLoggedIn = createSelector(
  selectUser,
  (user) => !!user,
);

export const selectIsUserRegistered = createSelector(
  selectUserData,
  (user) => !!user,
);
