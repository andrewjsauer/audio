/* eslint-disable no-shadow */
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export enum AuthScreens {
  SignInScreen = 'SignInScreen',
  PhoneNumberStep = 'PhoneNumberScreen',
  UserNameStep = 'UserNameScreen',
  BirthdayStep = 'BirthdayScreen',
  PartnerNameStep = 'PartnerNameScreen',
  RelationshipTypeStep = 'RelationshipTypeScreen',
  RelationshipDateStep = 'RelationshipDateScreen',
  InviteStep = 'InviteScreen',
}

export type UserDataType = {
  birthDate?: Date;
  color?: string;
  createdAt?: FirebaseFirestoreTypes.FieldValue;
  id?: string;
  isRegistered?: boolean;
  lastActiveAt?: FirebaseFirestoreTypes.FieldValue;
  name?: string;
  partnershipId?: string;
  phoneNumber?: string;
};

export type PartnershipDataType = {
  id?: string;
  startDate: Date;
  type: string;
  createdAt: FirebaseFirestoreTypes.FieldValue;
};

export type UserDetailsType = {
  birthDate?: Date;
  color?: string;
  name?: string;
  phoneNumber?: string;
};

export type PartnerDetailsType = {
  name?: string;
  phoneNumber?: string;
  color?: string;
};

export type PartnershipDetailsType = {
  startDate?: Date;
  type?: string;
};
