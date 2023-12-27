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
  BrowserScreen = 'BrowserScreen',
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
  AccountSettingsScreen = 'AccountSettingsScreen',
}

export enum ModalScreens {
  RecordUserModal = 'RecordUserModal',
  PlayUserModal = 'PlayUserModal',
}

export enum HistoryScreens {
  HistoryScreen = 'QuestionSubscriberScreen',
  PlayUserModal = 'PlayUserModal',
}

export enum AccountScreens {
  SettingsScreen = 'SettingsScreen',
  ColorScreen = 'ColorScreen',
  NameScreen = 'NameScreen',
}

export type UserDataType = {
  birthDate?: Date;
  color?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  deviceIds?: FirebaseFirestoreTypes.Timestamp;
  hasSubscribed?: boolean;
  id?: string;
  isRegistered?: boolean;
  isSubscribed?: boolean;
  lastActiveAt?: FirebaseFirestoreTypes.Timestamp;
  name?: string;
  partnershipId?: string;
  phoneNumber?: string;
};

export type PartnershipDataType = {
  id?: string;
  startDate?: Date;
  type?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  latestQuestionId?: string;
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
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  id: string;
  partnershipId: string;
  text: string;
};

export enum QuestionStatusType {
  Lock = 'Lock',
  PendingRecord = 'PendingRecord',
  Play = 'Play',
  Record = 'Record',
}

export enum ReactionType {
  Love = 'love',
  Laugh = 'laugh',
  Cute = 'cute',
  Fire = 'fire',
}

export enum ReactionTypeIcons {
  love = '❤️',
  laugh = '😂',
  cute = '🥹',
  fire = '🔥',
}

export type RecordingType = {
  audioUrl: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  didLikeQuestion: boolean | null;
  duration: string;
  feedbackText: string | null;
  id: string;
  partnershipId: string;
  questionId: string;
  reaction: ReactionType[] | null;
  userId: string;
};

export type HistoryType = {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  id: string;
  partnerAudioUrl: string | null;
  partnerColor: string;
  partnerDuration: string | null;
  partnerReactionToUser: ReactionType | null;
  partnerRecordingId: string | null;
  partnershipTextKey: string;
  partnerStatus: QuestionStatusType;
  text: string;
  userAudioUrl: string | null;
  userColor: string;
  userDuration: string | null;
  userReactionToPartner: ReactionType | null;
  userRecordingId: string | null;
  userStatus: QuestionStatusType;
};

export type ListeningType = {
  id: string;
  recordingId: string;
  userId: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  reaction: ReactionType;
};
