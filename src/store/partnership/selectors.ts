export const selectPartnershipData = (state) => state.partnership.partnershipData;
export const selectIsLoadingPartnerData = (state) => state.partnership.isLoadingPartnerData;
export const selectIsLoadingPartnershipData = (state) => state.partnership.isLoadingPartnershipData;
export const selectError = (state) => state.partnership.error;
export const selectPartnerData = (state) => state.partnership.partnerData;
export const selectPartnerName = (state) => state.partnership.partnerData?.name;
export const selectPartnerColor = (state) => state.partnership.partnerData?.color;
export const selectLastFailedAction = (state) => state.partnership.lastFailedAction;
export const selectIsLoading = (state) =>
  state.partnership.isLoadingPartnerData || state.partnership.isLoadingPartnershipData;
export const selectPartnershipUserData = (state) => state.partnership.partnershipUserData;
