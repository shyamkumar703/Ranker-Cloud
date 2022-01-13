const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.newVote = functions.firestore.document("polls/{documentId}")
    .onUpdate((change, context) => {
        const message = {
            notification: {
                title: "Someone voted on your poll!",
                body: "You have a new vote on your poll.",
            },
        };

        const tokens = [change.after.data().deviceId];
        functions.logger.log("Fetched Device ID", tokens[0]);
        return admin.messaging().sendToDevice(tokens, message);
    });
