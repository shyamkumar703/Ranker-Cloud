const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
admin.initializeApp();

exports.newVote = functions.firestore.document("polls/{documentId}")
    .onUpdate((change, context) => {
      const message = {
        notification: {
          title: "Rankr",
          body: "You have a new vote on your poll.",
        },
        data: {
          pollId: context.params.documentId
        }
      };

      const tokens = [change.after.data().deviceId];
      functions.logger.log("Fetched Device ID", tokens[0]);
      functions.logger.log("New vote on poll with ID, context.params.documentId)
      return admin.messaging().sendToDevice(tokens, message);
    });
exports.getLocalPolls = function.https.onCall((data, context) => {
  const uid = data.uid;
  const latitude = data.latitude;
  const longitude = data.longitude;


if (!uid) {
  throw new functions.https.HttpsError('unauthenticated-request', 'The function must be called with a uid');
}
if (!latitude || !(typeof latitude === 'number')) {
  throw new functions.https.HttpsError('invalid paramter', 'latitude is either null or not a number');
}
if (!longitude || !(typeof longitude  === 'number')) {
  throw new functions.https.HttpsError('invalid paramter', 'longitude is either null or not a number');
}
//fetch polls witihn 5 miles
const firestore = getFirestore();
const pollsRef = firestore.collection("polls");
const pollsRefSnapshot = await pollsRef.get();
pollsRefSnapshot.forEach(doc => {
  console.log(doc.id, '=>', doc.data());
});
});
