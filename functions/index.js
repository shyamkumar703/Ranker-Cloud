/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
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
    functions.logger.log("New vote on poll with ID, context.params.documentId");
    return admin.messaging().sendToDevice(tokens, message);
  });

exports.getLocalPolls = functions.https.onCall((data, context) => {
  functions.logger.log(data);
  const uid = data.uid;
  const latitude = data.latitude;
  const longitude = data.longitude;


  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated-request', 'The function must be called with a uid');
  }
  if (latitude === undefined || !(typeof latitude === 'number')) {
    throw new functions.https.HttpsError('invalid parameter', 'latitude is either null or not a number');
  }
  if (longitude === undefined || !(typeof longitude === 'number')) {
    throw new functions.https.HttpsError('invalid parameter', 'longitude is either null or not a number');
  }
  //fetch polls within 5 miles
  const firestore = getFirestore();
  const pollsRef = firestore.collection("polls");
  return pollsRef.get().then((snapshot) => {
    var validPolls = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const pollLatitude = data.latitude;
      const pollLongitude = data.longitude;
      if (pollLatitude === undefined || pollLongitude === undefined) {
        functions.logger.log(pollLatitude, pollLongitude);
      } else {
        functions.logger.log(distance(pollLatitude, latitude, pollLongitude, longitude));
        if (distance(pollLatitude, latitude, pollLongitude, longitude) <= 5) {
          validPolls.push(data);
        }
      }
    });
    return { "result": validPolls };
  }).catch((err) => functions.logger.log(err));
});

// helper functions

// distance in miles between two points
function distance(lat1, lat2, lon1, lon2) {
  // points to radians
  lon1 = lon1 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  // haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // radius of earth
  let r = 3956;

  return (c * r);
}