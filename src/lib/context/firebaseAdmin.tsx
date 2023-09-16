// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w',
  authDomain: 'twitter-web3.firebaseapp.com',
  projectId: 'twitter-web3',
  storageBucket: 'twitter-web3.appspot.com',
  messagingSenderId: '925953423560',
  appId: '1:925953423560:web:0c87f77ad6eb876d2d0dfd',
  measurementId: 'G-NK1704HW5G'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
