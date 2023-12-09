import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'gs://audio-20f30.appspot.com',
});

exports.sendPartnerInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Endpoint requires authentication!',
    );
  }

  const { phoneNumber, partnerName } = data;
  try {
    await admin
      .firestore()
      .collection('sms')
      .add({
        to: phoneNumber,
        body: `Hey ${partnerName}! We've got an invite for you to join 'You First'. It's a unique way to answer daily personalized questions together. Download it here: [link] 😊`,
      });

    functions.logger.info('SMS sent successfully!');
  } catch (error: unknown) {
    const e = error as {
      response?: { status?: string; data?: object };
      message?: string;
    };

    if (e.response) {
      functions.logger.error(`Error status ${e.response.status}`);
      functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);
    } else {
      functions.logger.error(`Error message ${error}`);
    }
  }
});
