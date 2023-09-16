import * as admin from 'firebase-admin';

const serviceAccount = require('./twitter-web3-firebase-adminsdk-j35np-2b073a4414.json'); // Replace with your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://twitter-web3-default-rtdb.firebaseio.com' // Replace with your database URL
});

export const db = admin.firestore();
