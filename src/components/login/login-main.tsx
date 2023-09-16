import { useAuth } from '@lib/context/auth-context';
import { NextImage } from '@components/ui/next-image';
import { CustomIcon } from '@components/ui/custom-icon';
import { Button } from '@components/ui/button';
import { useWeb3 } from '../../lib/context/web3-context';
import web3Auth from '../../lib/context/web3-auth';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaCheckCircle } from 'react-icons/fa'; // Import the success icon
// import db from './../../lib/context/firebaseAdmin';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'; // Import Firebase Firestore functions
import { initializeApp } from 'firebase/app';

export function LoginMain(): JSX.Element {
  const { signInWithGoogle } = useAuth();
  // const { web3, handleWeb3Registration } = useWeb3();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const firebaseConfig = {
    apiKey: 'AIzaSyD-ALyD7Xmm5ClCVYeU8OcDW0OVKU66m4w',
    authDomain: 'twitter-web3.firebaseapp.com',
    projectId: 'twitter-web3',
    storageBucket: 'twitter-web3.appspot.com',
    messagingSenderId: '925953423560',
    appId: '1:925953423560:web:0c87f77ad6eb876d2d0dfd',
    measurementId: 'G-NK1704HW5G'
  };

  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function handleWeb3ButtonClick() {
    try {
      const { accounts } = await web3Auth();

      if (accounts.length === 0) {
        console.error('MetaMask is not connected.');
        return;
      }

      const userAddress = accounts[0];
      console.log('Web3 accounts:', userAddress);

      // Generate a referral code (6 characters for example)
      const referralCode = generateRandomCode(6);

      // Save the user's Ethereum address to the "userAddress" collection
      const docRef = doc(db, 'userAddress', userAddress);
      await setDoc(docRef, {
        ethereumAddress: userAddress,
        referralCode: referralCode
      });

      setIsSuccessModalOpen(true); // Show the success modal
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  }

  function generateRandomCode(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }

    return code;
  }

  return (
    <main className='grid lg:grid-cols-[1fr,45vw]'>
      <div className='relative hidden items-center justify-center  lg:flex'>
        <NextImage
          imgClassName='object-cover '
          blurClassName='bg-accent-blue backdrop-blur-6 blur-6'
          src='/assets/blur.png'
          alt='Twitter banner'
          layout='fill'
          useSkeleton
        />
        <i className='absolute'>
          <CustomIcon className='h-96 w-96 text-white' iconName='TwitterIcon' />
        </i>
      </div>
      <div className='flex flex-col items-center justify-between gap-6 p-8 lg:items-start lg:justify-center'>
        <i className='mb-0 self-center lg:mb-10 lg:self-auto'>
          <CustomIcon
            className='-mt-4 h-6 w-6 text-accent-blue lg:h-12 lg:w-12 dark:lg:text-twitter-icon'
            iconName='TwitterIcon'
          />
        </i>
        <div className='flex max-w-xs flex-col gap-4 font-twitter-chirp-extended lg:max-w-none lg:gap-16'>
          <h1
            className='text-3xl before:content-["See_what’s_happening_in_the_world_right_now."] 
                       lg:text-6xl lg:before:content-["Visually_Appealing"]'
          />
          <h2 className='hidden text-xl lg:block lg:text-3xl'>
            Join Degen Diaries today.
          </h2>
        </div>
        <div className='flex max-w-xs flex-col gap-6 [&_button]:py-2'>
          <div className='grid gap-3 font-bold'>
            <Button
              className='flex justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition
                         hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white
                         dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              onClick={signInWithGoogle}
            >
              <CustomIcon iconName='GoogleIcon' />
              {/* Sign up with Google */}
              Register with Google
            </Button>
            {/* <Button
              className='flex cursor-not-allowed justify-center gap-2 border border-light-line-reply font-bold text-light-primary
                         transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0
                         dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
            >
              <CustomIcon iconName='AppleIcon' /> Sign up with Apple
            </Button> */}
            <div className='grid w-full grid-cols-[1fr,auto,1fr] items-center gap-2'>
              <i className='border-b border-light-border dark:border-dark-border' />
              <p>or</p>
              <i className='border-b border-light-border dark:border-dark-border' />
            </div>
            {/* <Button
              className='cursor-not-allowed bg-accent-blue text-white transition hover:brightness-90
                         focus-visible:!ring-accent-blue/80 focus-visible:brightness-90 active:brightness-75'
            >
              Sign up with phone or email
            </Button> */}

            <Button
              className='flex cursor-pointer justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition
                 hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white
                 dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              onClick={handleWeb3ButtonClick} // Call handleWeb3ButtonClick when clicked
            >
              <CustomIcon iconName='MetaMaskIcon' /> Register with Web3.0
            </Button>
            <p
              className='inner:custom-underline inner:custom-underline text-center text-xs
                         text-light-secondary inner:text-accent-blue dark:text-dark-secondary'
            >
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
              className='border border-light-line-reply font-bold text-accent-blue hover:bg-accent-blue/10
                         focus-visible:bg-accent-blue/10 focus-visible:!ring-accent-blue/80 active:bg-accent-blue/20
                         dark:border-light-secondary'
              onClick={signInWithGoogle}
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
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
            <h3 className='mb-2 text-lg font-bold text-green-500 '>
              Wallet Connected Successfully!
            </h3>
            <p className='text-green-500 '>
              Your wallet has been successfully connected.
            </p>
          </div>
          <div className='mt-4 text-center'>
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              className='text-black'
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
