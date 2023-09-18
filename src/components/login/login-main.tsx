// import { useAuth } from '@lib/context/auth-context';
// import { NextImage } from '@components/ui/next-image';
// import { CustomIcon } from '@components/ui/custom-icon';
// import { Button } from '@components/ui/button';
// import { useWeb3 } from '../../lib/context/web3-context';
// import web3Auth from '../../lib/context/web3Auth';
// import { useState } from 'react';
// import { Dialog } from '@headlessui/react';
// import { FaCheckCircle } from 'react-icons/fa'; // Import the success icon
// // import db from './../../lib/context/firebaseAdmin';
// import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'; // Import Firebase Firestore functions
// import { initializeApp } from 'firebase/app';

// export function LoginMain(): JSX.Element {
//   const { signInWithGoogle } = useAuth();
//   // const { web3, handleWeb3Registration } = useWeb3();
//   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

//   // // Using the web3 instance from the context
//   // const { web3, connectWeb3, isConnecting } = useWeb3();

//   // const firebaseConfig = {
//   //   apiKey: 'AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w',
//   //   authDomain: 'twitter-web3.firebaseapp.com',
//   //   projectId: 'twitter-web3',
//   //   storageBucket: 'twitter-web3.appspot.com',
//   //   messagingSenderId: '925953423560',
//   //   appId: '1:925953423560:web:0c87f77ad6eb876d2d0dfd',
//   //   measurementId: 'G-NK1704HW5G'
//   // };

//   // // Initialize Firebase app
//   // const app = initializeApp(firebaseConfig);
//   // const db = getFirestore(app);

//   // const handleWeb3ButtonClick = async () => {
//   //   try {
//   //     if (!web3) {
//   //       console.error('Web3 instance not available.');
//   //       return;
//   //     }

//   //     const accounts = await web3.eth.getAccounts();

//   //     if (accounts.length === 0) {
//   //       console.error('MetaMask is not connected.');
//   //       return;
//   //     }

//   //     const userAddress = accounts[0];
//   //     console.log('Web3 accounts:', userAddress);

//   //     const docRef = doc(collection(db, 'users'), userAddress);
//   //     await setDoc(docRef, { ethereumAddress: userAddress });

//   //     setIsSuccessModalOpen(true); // Show the success modal
//   //   } catch (error) {
//   //     console.error('Error connecting to MetaMask:', error);
//   //   }
//   // };

//   // function generateRandomCode(length: number): string {
//   //   const characters =
//   //     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   //   let code = '';

//   //   for (let i = 0; i < length; i++) {
//   //     const randomIndex = Math.floor(Math.random() * characters.length);
//   //     code += characters[randomIndex];
//   //   }

//   //   return code;
//   // }

//   // const signInWithWeb3 = async (): Promise<void> => {
//   //   try {
//   //     await web3Auth();
//   //   } catch (error) {
//   //     // setError(error as Error);
//   //     console.log(error)
//   //   }
//   // };

//   return (
//     <main className='grid lg:grid-cols-[1fr,45vw]'>
//       <div className='relative hidden items-center justify-center  lg:flex'>
//         <NextImage
//           imgClassName='object-cover '
//           blurClassName='bg-accent-blue backdrop-blur-6 blur-6'
//           src='/assets/blur.png'
//           alt='Twitter banner'
//           layout='fill'
//           useSkeleton
//         />
//         {/* <i className='absolute'>
//           <CustomIcon className='h-96 w-96 text-white' iconName='TwitterIcon' />
//         </i> */}
//       </div>
//       <div className='flex flex-col items-center justify-between gap-6 p-8 lg:items-start lg:justify-center'>
//         <i className='mb-0 self-center lg:mb-10 lg:self-auto'>
//           <CustomIcon
//             className='-mt-4 h-6 w-6 text-accent-blue lg:h-12 lg:w-12 dark:lg:text-twitter-icon'
//             iconName='TwitterIcon'
//           />
//         </i>
//         <div className='flex max-w-xs flex-col gap-4 font-twitter-chirp-extended lg:max-w-none lg:gap-16'>
//           <h1
//             className='text-3xl before:content-["See_what’s_happening_in_the_world_right_now."]
//                        lg:text-6xl lg:before:content-["Visually_Appealing"]'
//           />
//           <h2 className='hidden text-xl lg:block lg:text-3xl'>
//             Join Degen Diaries today.
//           </h2>
//         </div>
//         <div className='flex max-w-xs flex-col gap-6 [&_button]:py-2'>
//           <div className='grid gap-3 font-bold'>
//             <Button
//               className='flex justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition
//                          hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white
//                          dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
//               onClick={signInWithGoogle}
//             >
//               <CustomIcon iconName='GoogleIcon' />
//               {/* Sign up with Google */}
//               Register with Google
//             </Button>
//             {/* <Button
//               className='flex cursor-not-allowed justify-center gap-2 border border-light-line-reply font-bold text-light-primary
//                          transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0
//                          dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
//             >
//               <CustomIcon iconName='AppleIcon' /> Sign up with Apple
//             </Button> */}
//             <div className='grid w-full grid-cols-[1fr,auto,1fr] items-center gap-2'>
//               <i className='border-b border-light-border dark:border-dark-border' />
//               <p>or</p>
//               <i className='border-b border-light-border dark:border-dark-border' />
//             </div>
//             {/* <Button
//               className='cursor-not-allowed bg-accent-blue text-white transition hover:brightness-90
//                          focus-visible:!ring-accent-blue/80 focus-visible:brightness-90 active:brightness-75'
//             >
//               Sign up with phone or email
//             </Button> */}

//             <Button
//               className='flex cursor-pointer justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition
//                  hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white
//                  dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
//                 //  onClick={() => connectWeb3()} // Call connectWeb3 when clicked
//                 //  disabled={isConnecting} // Disable the button while connecting // Call handleWeb3ButtonClick when clicked

//             >
//               <CustomIcon iconName='MetaMaskIcon' /> Register with Web3.0
//             </Button>
//             <p
//               className='inner:custom-underline inner:custom-underline text-center text-xs
//                          text-light-secondary inner:text-accent-blue dark:text-dark-secondary'
//             >
//               By signing up, you agree to the{' '}
//               <a
//                 href='https://twitter.com/tos'
//                 target='_blank'
//                 rel='noreferrer'
//               >
//                 Terms of Service
//               </a>{' '}
//               and{' '}
//               <a
//                 href='https://twitter.com/privacy'
//                 target='_blank'
//                 rel='noreferrer'
//               >
//                 Privacy Policy
//               </a>
//               , including{' '}
//               <a
//                 href='https://help.twitter.com/rules-and-policies/twitter-cookies'
//                 target='_blank'
//                 rel='noreferrer'
//               >
//                 Cookie Use
//               </a>
//               .
//             </p>
//           </div>
//           <div className='flex flex-col gap-3'>
//             <p className='font-bold'>Already have an account? </p>
//             <Button
//               className='border border-light-line-reply font-bold text-accent-blue hover:bg-accent-blue/10
//                          focus-visible:bg-accent-blue/10 focus-visible:!ring-accent-blue/80 active:bg-accent-blue/20
//                          dark:border-light-secondary'
//               onClick={signInWithGoogle}
//             >
//               Sign in
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {/* Success Modal */}
//       <Dialog
//         open={isSuccessModalOpen}
//         onClose={() => setIsSuccessModalOpen(false)}
//         as='div'
//         className='fixed inset-0 z-50 flex items-center justify-center'
//       >
//         <div className='w-full max-w-md rounded-lg bg-white p-8'>
//           <div className='text-center'>
//             <FaCheckCircle className='mb-4 text-6xl text-green-500' />
//             <h3 className='mb-2 text-lg font-bold text-green-500 '>
//               Wallet Connected Successfully!
//             </h3>
//             <p className='text-green-500 '>
//               Your wallet has been successfully connected.
//             </p>
//           </div>
//           <div className='mt-4 text-center'>
//             <Button
//               onClick={() => setIsSuccessModalOpen(false)}
//               className='text-black'
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       </Dialog>
//     </main>
//   );
// }

// import { useAuth } from '@lib/context/auth-context';

import { useAuth } from '@lib/context/web3-auth-context';
import { NextImage } from '@components/ui/next-image';
import { CustomIcon } from '@components/ui/custom-icon';
import { Button } from '@components/ui/button';
import { useWeb3 } from '../../lib/context/web3-context';
import web3Auth from '../../lib/context/web3Auth';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaCheckCircle } from 'react-icons/fa'; // Import the success icon
import { useWeb3Modal } from '@web3modal/react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName
} from 'wagmi';

export function LoginMain(): JSX.Element {
  // const { signInWithGoogle } = useAuth();
  const { connectWithWallet } = useAuth();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { open, close } = useWeb3Modal();
  const { address, connector, isConnected } = useAccount();
  // const { data: ensAvatar } = useEnsAvatar({ address });
  // const { data: ensName } = useEnsName({ address });
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const [web3Address, setWeb3Address] = useState('');

  const handleConnect = async () => {
    open();
  };

  useEffect(() => {
    setWeb3Address(address);
  }, [address]);

  // useEffect(() => {
  //   let timer;
  //   if (isConnected) {
  //     timer = setTimeout(() => {
  //       setIsSuccessModalOpen(true);
  //     }, 5000);
  //   }

  //   return () => {
  //     clearTimeout(timer); // Clear the timer if the component unmounts or if isConnected becomes false
  //   };
  // }, [isConnected]);

  return (
    <main
      className='flex h-screen flex-col items-center justify-center lg:grid lg:grid-cols-[1fr,45vw]'
      style={{
        backgroundImage: `url('/assets/blur.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex'
      }}
    >
      <div className='flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-white bg-opacity-30 p-8 backdrop-blur-lg'>
        <CustomIcon
          className='-mt-4 h-12 w-12 text-accent-blue lg:h-24 lg:w-24 dark:lg:text-twitter-icon'
          iconName='TwitterIcon'
        />
        <div className='flex max-w-md flex-col gap-4 text-white lg:max-w-2xl lg:gap-16'>
          <h1 className="text-center text-3xl before:content-['Visually_Appealing'] lg:text-6xl" />
          <h2 className='hidden text-xl lg:block lg:text-3xl'>
            Join Degen Diaries today.
          </h2>
        </div>
        <div className='flex flex-col gap-6 py-2'>
          <div className='grid gap-3 font-bold'>
            <Button
              className='flex justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              // onClick={signInWithGoogle}
            >
              <CustomIcon iconName='GoogleIcon' />
              Register with Google
            </Button>

            <div className='flex flex-col gap-3'>
              <i className='border-b border-light-border dark:border-dark-border' />
              <p>or</p>
              {web3Address && <p>Connected Wallet Address: {web3Address}</p>}

              <i className='border-b border-light-border dark:border-dark-border' />
            </div>
            <Button
              className='flex cursor-pointer justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              // onClick={handleConnect} // Use the event handler here
              onClick={connectWithWallet} // Use the event handler here
            >
              <CustomIcon iconName='MetaMaskIcon' /> Register with Web3.0
            </Button>
            <p className='inner:custom-underline inner:custom-underline text-center text-xs text-light-secondary inner:text-accent-blue dark:text-dark-secondary'>
              By signing up, you agree to the{' '}
              <a
                href='https://twitter.com/tos'
                target='_blank'
                rel='noreferrer'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='https://twitter.com/privacy'
                target='_blank'
                rel='noreferrer'
              >
                Privacy Policy
              </a>
              , including{' '}
              <a
                href='https://help.twitter.com/rules-and-policies/twitter-cookies'
                target='_blank'
                rel='noreferrer'
              >
                Cookie Use
              </a>
              .
            </p>
          </div>
          <div className='flex flex-col gap-3'>
            <p className='font-bold'>Already have an account? </p>
            <Button
              className='border border-light-line-reply font-bold text-accent-blue hover:bg-accent-blue/10 focus-visible:bg-accent-blue/10 focus-visible:!ring-accent-blue/80 active:bg-accent-blue/20 dark:border-light-secondary'
              // onClick={signInWithGoogle}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        as='div'
        className='fixed inset-0 z-50 flex items-center justify-center'
      >
        <div className='w-full max-w-md rounded-lg bg-white p-8'>
          <div className='text-center'>
            <FaCheckCircle className='mb-4 text-6xl text-green-500' />
            <h3 className='mb-2 text-lg font-bold text-green-500'>
              {isConnected
                ? `Wallet is Already connected to ${
                    connector && connector?.name
                  }`
                : 'Wallet Connected Successfully!'}
            </h3>
            <p className='text-green-500'>
              Your wallet has been successfully connected.
            </p>
            <p className='text-green-500'>
              Wallet Address .{' '}
              {/* <span>{ensName ? `${ensName} (${address})` : address}</span> */}
            </p>
            <p className='text-green-500'>
              <span>Connected to {connector && connector?.name}</span>
            </p>
          </div>
          <div className='mt-4 text-center'>
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              className='text-black'
            >
              Close
            </Button>
            <Button onClick={disconnect} className='text-black'>
              Disconnect
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
