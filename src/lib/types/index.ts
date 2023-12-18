/* eslint-disable no-shadow */
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export enum RootScreens {
  AuthStack = 'AuthStack',
  AppStack = 'AppStack',
}

export enum AppScreens {
  QuestionScreen = 'QuestionScreen',
  AccountScreen = 'AccountScreen',
  HistoryScreen = 'HistoryScreen',
  TrialScreen = 'TrialScreen',
}

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

export enum QuestionScreens {
  QuestionSubscriberScreen = 'QuestionSubscriberScreen',
  QuestionNonSubscriberScreen = 'QuestionNonSubscriberScreen',
}

export enum HistoryScreens {
  HistorySubscriberScreen = 'HistorySubscriberScreen',
  HistoryNonSubscriberScreen = 'HistoryNonSubscriberScreen',
}

export type UserDataType = {
  birthDate?: Date;
  color?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  deviceIds?: FirebaseFirestoreTypes.Timestamp;
  id?: string;
  isRegistered?: boolean;
  lastActiveAt?: FirebaseFirestoreTypes.Timestamp;
  name?: string;
  partnershipId?: string;
  phoneNumber?: string;
};

export type PartnershipDataType = {
  id?: string;
  startDate: Date;
  type: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
};

export type PartnershipUserDataType = {
  id?: string;
  partnershipId?: string;
  userId?: string;
  otherUserId?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
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

export type QuestionType = {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  id: string;
  partnershipId: string;
  text: string;
};
