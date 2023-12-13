const admin = require('firebase-admin');
const serviceAccount = require('./twitter-web3-firebase-adminsdk-j35np-dc879cc50b');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeUserChatsSubCollection() {
  const usersRef = db.collection('users');
  const usersSnapshot = await usersRef.get();

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userChatsRef = usersRef.doc(userId).collection('userChats');

    // Fetch all chats that include the user
    const chatsSnapshot = await db
      .collection('chats')
      .where('userIds', 'array-contains', userId)
      .get();

    for (const chatDoc of chatsSnapshot.docs) {
      const chatId = chatDoc.id;
      const userChatRef = userChatsRef.doc(chatId);

      // Initialize or update the chat document in the user's sub-collection
      await userChatRef.set(
        {
          isPinned: false,
          isMuted: false,
          isDeleted: false
        },
        { merge: true }
      );
    }
  }

  console.log('All userChats sub-collections initialized successfully');
}

initializeUserChatsSubCollection().catch((error) => {
  console.error('Error initializing userChats sub-collections:', error);
});
