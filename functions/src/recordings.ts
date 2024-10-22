import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { getDownloadURL } from 'firebase-admin/storage';
import { defineSecret } from 'firebase-functions/params';

import fetch from 'cross-fetch';
import crypto from 'crypto-js';

import { trackEvent } from './analytics';

const recordingEncryptionKey = defineSecret('RECORDING_ENCRYPTION_KEY');

export const getRecording = functions
  .runWith({ secrets: [recordingEncryptionKey], memory: '512MB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const encryptionKey = recordingEncryptionKey.value();
    const { audioUrl } = data;

    try {
      const response = await fetch(audioUrl);
      const encryptedDataBase64 = await response.text();

      functions.logger.debug(`Encrypted data size: ${encryptedDataBase64.length} bytes`);

      const decrypted = crypto.AES.decrypt(encryptedDataBase64, encryptionKey);
      const decryptedData = crypto.enc.Base64.stringify(decrypted);

      functions.logger.debug(`Decrypted data size: ${decryptedData.length} bytes`);

      return { audioData: decryptedData };
    } catch (error: any) {
      functions.logger.error(`Error retrieving and decrypting recording: ${error.message}`);
      throw new functions.https.HttpsError('internal', 'Error retrieving and decrypting recording');
    }
  });

export const saveRecording = functions
  .runWith({ secrets: [recordingEncryptionKey], memory: '512MB' })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const encryptionKey = recordingEncryptionKey.value();

    const { base64Data, questionId, userData, duration, partnerData } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const { id: userId, partnershipId, hasSeenPrivacyReminder = false } = userData;
    const recordingId = `${userId}_${questionId}`;

    try {
      functions.logger.debug(`Original Base64 data size: ${base64Data.length} characters`);
      const encrypted = crypto.AES.encrypt(base64Data, encryptionKey).toString();
      functions.logger.debug(`Encrypted Base64 data size: ${encrypted.length} characters`);

      const storageRef = admin.storage().bucket().file(`recordings/${recordingId}.enc`);

      await storageRef.save(encrypted, {
        contentType: 'application/octet-stream',
      });

      const audioUrl = await getDownloadURL(storageRef);

      const recordingData = {
        audioUrl,
        createdAt: admin.firestore.Timestamp.now(),
        didLikeQuestion: null,
        duration,
        feedbackText: null,
        id: recordingId,
        partnershipId,
        questionId,
        reaction: [],
        userId,
      };

      await admin
        .firestore()
        .collection('recordings')
        .doc(recordingId)
        .set(recordingData, { merge: true });

      if (!hasSeenPrivacyReminder) {
        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .set({ hasSeenPrivacyReminder: true }, { merge: true });
      }

      if (partnerData.deviceIds && partnerData.deviceIds.length > 0) {
        await admin.messaging().sendEachForMulticast({
          tokens: partnerData.deviceIds,
          notification: {
            title: `Daily Q’s`,
            body: `${userData.name} answered today's question!`,
          },
        });
      } else {
        await admin
          .firestore()
          .collection('sms')
          .add({
            phoneNumber: partnerData.phoneNumber,
            body: `${userData.name} answered today's question on Daily Q’s! Download the app to listen to their answer. Link: https://www.daily-qs.com`,
          });
      }

      trackEvent('Recorded Answer', userId, {
        questionId,
        duration,
        partnerId: partnerData.id,
      });

      return { ...recordingData };
    } catch (error: unknown) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);
        throw new functions.https.HttpsError(
          'unknown',
          `Error saving recording: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);
        throw new functions.https.HttpsError('unknown', `Error saving recording: ${error}`, error);
      }
    }
  });
