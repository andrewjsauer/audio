import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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
