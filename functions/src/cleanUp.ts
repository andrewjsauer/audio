import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getDownloadURL } from 'firebase-admin/storage';

export const cleanUpUser = functions.firestore.document('cleanUp/{docId}').onCreate(async () => {
  const oldUserId = 'hobysqjNJYSjQb8Em1bti2LGK1j1';
  const newUserId = '7FstoN6OgihrrAaq6TrOBITOCpk1';

  const userCollectionRef = admin.firestore().collection('users');

  try {
    const oldUserDoc = await userCollectionRef.doc(oldUserId).get();

    if (!oldUserDoc.exists) {
      functions.logger.debug('Old user document does not exist');
      return null;
    }

    const copiedOldUserDoc = oldUserDoc.data() as any;
    await userCollectionRef.doc(newUserId).set(copiedOldUserDoc, { merge: true });

    functions.logger.debug('User data successfully copied to the new user ID');
    return null;
  } catch (error) {
    functions.logger.error('Error copying user data:', error);
    return null;
  }
});

export const updateRecordingUrl = functions.firestore
  .document('cleanUp/{docId}')
  .onCreate(async () => {
    const recordingId = 'JZAz3PCotEOkO7kLPvnpmA5PzKN2_555b5143-dd8f-4d1c-b488-7218c350300b';
    const recordingsCollectionRef = admin.firestore().collection('recordings');
    const storageBucket = admin.storage();

    try {
      const recordingDoc = await recordingsCollectionRef.doc(recordingId).get();

      if (!recordingDoc.exists) {
        functions.logger.debug('Recording document does not exist');
        return null;
      }

      const fileRef = storageBucket.bucket().file(`recordings/${recordingId}.enc`);
      const newAudioUrl = await getDownloadURL(fileRef);

      functions.logger.debug('New audio url', newAudioUrl);

      await recordingsCollectionRef.doc(recordingId).update({
        audioUrl: newAudioUrl,
      });

      functions.logger.debug('Recording URL successfully updated');
      return null;
    } catch (error) {
      functions.logger.error('Error updating recording URL:', error);
      return null;
    }
  });

export const updateAllRecordingUrls = functions.firestore
  .document('cleanUp/{docId}')
  .onCreate(async () => {
    const recordingsCollectionRef = admin.firestore().collection('recordings');
    const storageBucket = admin.storage().bucket();

    try {
      const snapshot = await recordingsCollectionRef.get();

      if (snapshot.empty) {
        functions.logger.debug('No recording documents found');
        return null;
      }

      const updatePromises = snapshot.docs.map((doc) => {
        const recordingId = doc.id;
        const filePath = `recordings/${recordingId}.enc`;
        const fileRef = storageBucket.file(filePath);

        return getDownloadURL(fileRef)
          .then((newAudioUrl) => {
            return recordingsCollectionRef.doc(recordingId).update({ audioUrl: newAudioUrl });
          })
          .catch((error) => {
            functions.logger.error(
              `Error updating URL for recording ${filePath} and ${recordingId}:`,
              error,
            );
          });
      });

      await Promise.all(updatePromises);

      functions.logger.debug('All recording URLs successfully updated');
      return null;
    } catch (error) {
      functions.logger.error('Error updating recording URLs:', error);
      return null;
    }
  });

export const testSMS = functions.firestore.document('cleanUp/{docId}').onCreate(async () => {
  const smsRef = admin.firestore().collection('sms').doc();
  const sms = {
    to: '+16262552193',
    body: `Hey, Andrew! Linda has invited you to join Daily Q’s. Have fun 😊!
    
        Link: https://www.daily-qs.com
      `,
  };

  try {
    await smsRef.set(sms);
    functions.logger.log('SMS successfully sent');
    return null;
  } catch (error) {
    functions.logger.error('Error sending SMS:', error);
    return null;
  }
});
