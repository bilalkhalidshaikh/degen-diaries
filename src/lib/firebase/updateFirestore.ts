const admin = require('firebase-admin');
const serviceAccount = require('./twitter-web3-firebase-adminsdk-j35np-dc879cc50b.json'); // Update this path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addNewFieldsToAllDocuments() {
  const collectionRef = db.collection('users'); // or 'chats'
  const snapshot = await collectionRef.get();

  const updates = snapshot.docs.map((docSnapshot) => {
    const docRef = db.collection('users').doc(docSnapshot.id); // or 'chats'
    return docRef.update({
      isPinned: false,
      isMuted: false,
      isDeleted: false
    });
  });

  await Promise.all(updates);
  console.log('All documents updated successfully');
}

addNewFieldsToAllDocuments().catch((error) =>
  console.error('Error updating documents:', error)
);
