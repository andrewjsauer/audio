/* eslint-disable no-shadow */
export enum SignInFlowStepTypes {
  SignInStep = 'SignInStep',
  PhoneNumberStep = 'PhoneNumberStep',
  UserDetailsStep = 'UserDetailsStep',
  PartnerDetailsStep = 'PartnerDetailsStep',
}

export enum PartnerDetailsSteps {
  PartnerNameStep = 'PartnerNameScreen',
  RelationshipTypeStep = 'RelationshipTypeScreen',
  RelationshipDateStep = 'RelationshipDateScreen',
  InviteStep = 'InviteScreen',
}

export enum UserDetailsSteps {
  UserNameStep = 'UserNameScreen',
  BirthdayStep = 'BirthdayScreen',
}
