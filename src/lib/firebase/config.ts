const config = {
  apiKey: 'AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w',
  authDomain: 'twitter-web3.firebaseapp.com',
  projectId: 'twitter-web3',
  storageBucket: 'twitter-web3.appspot.com',
  messagingSenderId: '925953423560',
  appId: '1:925953423560:web:0c87f77ad6eb876d2d0dfd',
  measurementId: 'G-NK1704HW5G'
} as const;

type Config = typeof config;

export function getFirebaseConfig(): Config {
  if (Object.values(config).some((value) => !value))
    throw new Error('Firebase config is not set or incomplete');

  return config;
}

// apiKey: "AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w",
// authDomain: "twitter-web3.firebaseapp.com",
// projectId: "twitter-web3",
// storageBucket: "twitter-web3.appspot.com",
// messagingSenderId: "925953423560",
// appId: "1:925953423560:web:0c87f77ad6eb876d2d0dfd",
// measurementId: "G-NK1704HW5G"
