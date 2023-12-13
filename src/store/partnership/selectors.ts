export const selectPartnershipData = (state) =>
  state.partnership.partnershipData;

export const selectPartnerName = (state) => state.partnership.partnerData?.name;

export const selectPartnerColor = (state) =>
  state.partnership.partnerData?.color;
