import * as admin from 'firebase-admin';

import { checkTimeZones, sendNotification, sendSMS } from './notifications';
import { getRecording, saveRecording } from './recordings';
import { generatePartnership, updateNewUser, deletePartnership } from './partnership';
import { handleSubscriptionEvents, updatePartnershipPurchase } from './subscriptions';
import { generateQuestion, generateQuestionModified, checkMidnightInTimeZones } from './questions';
import { trackAnswerRecordedEvent } from './analytics';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

export {
  checkMidnightInTimeZones,
  checkTimeZones,
  deletePartnership,
  generatePartnership,
  generateQuestion,
  generateQuestionModified,
  getRecording,
  handleSubscriptionEvents,
  saveRecording,
  sendNotification,
  sendSMS,
  trackAnswerRecordedEvent,
  updateNewUser,
  updatePartnershipPurchase,
};
