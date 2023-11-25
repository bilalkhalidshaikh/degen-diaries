import { NextImage } from '@components/ui/next-image';
import { CustomIcon } from '@components/ui/custom-icon';
import { Button } from '@components/ui/button';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaCheckCircle } from 'react-icons/fa'; // Import the success icon
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName
} from 'wagmi';
// import { useAuth } from '@lib/context/auth-context';
import { useAuth } from '@lib/context/web3-auth-context'; // This assumes you have a Web3Auth context

export function LoginMain(): JSX.Element {
  // const { signInWithGoogle } = useAuth();
  const { connectWithWallet, disconnectWallet, user } = useAuth();

  // const { connectWithWallet } = useAuth();
  // const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  // const { open, close } = useWeb3Modal();
  // const { address, connector, isConnected } = useAccount();
  // // const { data: ensAvatar } = useEnsAvatar({ address });
  // // const { data: ensName } = useEnsName({ address });
  // const { connect, connectors, error, isLoading, pendingConnector } =
  //   useConnect();
  // const { disconnect } = useDisconnect();
  // const [web3Address, setWeb3Address] = useState('');
  // const [referralCode, setReferralCode] = useState('');

  // const handleConnect = async () => {
  //   open();
  // };

  // // This function can be called when the user clicks a "Submit Referral Code" button
  // const handleReferralCodeSubmitClick = async () => {
  //   await handleReferralCodeSubmission();
  //   try {
  //     // Call the backend function to validate the referral code
  //     const validateResponse = await firebase
  //       .functions()
  //       .httpsCallable('validateReferralCode')({ code: referralCode });

  //     // If the code is valid, proceed with creating the user and then redeem the code
  //     if (validateResponse.success) {
  //       // Assume createUser is a function to handle the new user registration
  //       const newUserId = await createUser(/* user details */);
  //       await firebase.functions().httpsCallable('redeemReferralCode')({
  //         code: referralCode,
  //         newUserId
  //       });
  //     }
  //   } catch (error) {
  //     // Handle the error accordingly
  //     console.error('Error validating or redeeming referral code:', error);
  //   }
  // };

  // useEffect(() => {
  //   setWeb3Address(address || '');
  // }, [address]);

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
          <h2 className='hidden text-center text-xl lg:block lg:text-3xl'>
            Join Degen Diaries today.
          </h2>
        </div>
        <div className='flex flex-col gap-6 py-2'>
          <div className='grid gap-3 font-bold'>
            {/* <Button
              className='flex justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              // onClick={signInWithGoogle}
            >
              <CustomIcon iconName='GoogleIcon' />
              Register with Google
            </Button>
            <input
              type='text'
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder='Enter referral code (if any)'
            />
            <Button
              // Assuming Button is a styled button component that accepts an onClick prop
              onClick={handleReferralCodeSubmitClick} // Call the handleReferralCodeSubmission function on click
            >
              Submit Referral Code
            </Button> */}

            <div className='flex flex-col gap-3'>
              {/* <i className='border-b border-light-border dark:border-dark-border' />
              <p>or</p> */}
              {/* {web3Address && <p>Connected Wallet Address: {web3Address}</p>} */}

              <i className='border-b border-light-border dark:border-dark-border' />
            </div>
            <Button
              className='flex cursor-pointer  justify-center gap-2 border border-light-line-reply bg-opacity-30 font-bold text-light-primary backdrop-blur-lg transition hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              // onClick={handleConnect} // Use the event handler here
              onClick={connectWithWallet} // Use the event handler here
            >
              <CustomIcon iconName='MetaMaskIcon' /> Register with Web3.0
            </Button>
            {/* <Button
              className='flex justify-center gap-2 border border-light-line-reply font-bold text-light-primary transition
                         hover:bg-[#e6e6e6] focus-visible:bg-[#e6e6e6] active:bg-[#cccccc] dark:border-0 dark:bg-white
                         dark:hover:brightness-90 dark:focus-visible:brightness-90 dark:active:brightness-75'
              // onClick={signInWithGoogle}
            >
              <CustomIcon iconName='GoogleIcon' /> Sign up with Google
            </Button> */}
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
            {/* You may also want to show the disconnect button only when the user is connected */}
            {user && (
              <Button
                className='border border-light-line-reply font-bold text-accent-blue hover:bg-accent-blue/10 focus-visible:bg-accent-blue/10 focus-visible:!ring-accent-blue/80 active:bg-accent-blue/20 dark:border-light-secondary'
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {/* <Dialog
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
      </Dialog> */}
    </main>
  );
}
