export const selectIsLoading = (state) => state.partnership.isLoading;
export const selectError = (state) => state.partnership.error;
export const selectPartnershipData = (state) =>
  state.partnership.partnershipData;
export const selectPartnerData = (state) => state.partnership.partnerData;
export const selectPartnerName = (state) => state.partnership.partnerData?.name;
export const selectPartnerColor = (state) =>
  state.partnership.partnerData?.color;
