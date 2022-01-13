const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
