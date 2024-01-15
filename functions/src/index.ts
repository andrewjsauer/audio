import * as admin from 'firebase-admin';

import { checkTimeZones, sendNotification, sendSMS } from './notifications';
import { getRecording, saveRecording } from './recordings';
import { generatePartnership, updateNewUser, deletePartnership } from './partnership';
import { handleSubscriptionEvents, updatePartnershipPurchase } from './subscriptions';
import { generateQuestion } from './questions';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

export {
  checkTimeZones,
  sendNotification,
  sendSMS,
  getRecording,
  saveRecording,
  generatePartnership,
  updateNewUser,
  deletePartnership,
  handleSubscriptionEvents,
  updatePartnershipPurchase,
  generateQuestion,
};
