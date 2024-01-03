export const selectError = (state) => state.partnership.error;
export const selectIsLoading = (state) => state.partnership.isLoading;
export const selectLastFailedAction = (state) => state.partnership.lastFailedAction;
export const selectPartnerColor = (state) => state.partnership.partnerData?.color;
export const selectPartnerData = (state) => state.partnership.partnerData;
export const selectPartnerName = (state) => state.partnership.partnerData?.name;
export const selectPartnershipData = (state) => state.partnership.partnershipData;
export const selectPartnershipUserData = (state) => state.partnership.partnershipUserData;
