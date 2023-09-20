const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const firestore = admin.firestore();

exports.updateTweetScore = functions.firestore
  .document('tweets/{tweetId}')
  .onWrite((change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Calculate the new score
    const newScore = (newData.likesCount || 0) + (newData.commentsCount || 0);

    // Update the score in the document
    return change.after.ref.set({ score: newScore }, { merge: true });
  });
