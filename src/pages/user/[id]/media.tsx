// import { AnimatePresence } from 'framer-motion';
// import { query, where } from 'firebase/firestore';
// import { useCollection } from '@lib/hooks/useCollection';
// import { tweetsCollection } from '@lib/firebase/collections';
// import { useUser } from '@lib/context/user-context';
// import { mergeData } from '@lib/merge';
// import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
// import { MainLayout } from '@components/layout/main-layout';
// import { SEO } from '@components/common/seo';
// import { UserDataLayout } from '@components/layout/user-data-layout';
// import { UserHomeLayout } from '@components/layout/user-home-layout';
// import { Tweet } from '@components/tweet/tweet';
// import { Loading } from '@components/ui/loading';
// import { StatsEmpty } from '@components/tweet/stats-empty';
// import type { ReactElement, ReactNode } from 'react';

// export default function UserMedia(): JSX.Element {
//   const { user } = useUser();

//   const { id, name, username } = user ?? {};

//   const { data, loading } = useCollection(
//     query(
//       tweetsCollection,
//       where('createdBy', '==', id),
//       where('images', '!=', null)
//     ),
//     { includeUser: true, allowNull: true }
//   );

//   const sortedTweets = mergeData(true, data);

//   return (
//     <section>
//       {/* <SEO
//         title={`Media Tweets by ${name as string} (@${
//           username as string
//         }) / Twitter`}
//       />
//       {loading ? (
//         <Loading className='mt-5' />
//       ) : !sortedTweets ? (
//         <StatsEmpty
//           title={`@${username as string} hasn't Tweeted Media`}
//           description='Once they do, those Tweets will show up here.'
//           imageData={{ src: '/assets/no-media.png', alt: 'No media' }}
//         />
//       ) : (
//         <AnimatePresence mode='popLayout'>
//           {sortedTweets.map((tweet) => (
//             <Tweet {...tweet} key={tweet.id} />
//           ))}
//         </AnimatePresence>
//       )} */}
//       <StatsEmpty
//         title={`This wallet does not has any Trades yet`}
//         description='When they do, those Trades will show up here.'
//       />
//     </section>
//   );
// }

// UserMedia.getLayout = (page: ReactElement): ReactNode => (
//   <ProtectedLayout>
//     <MainLayout>
//       <UserLayout>
//         <UserDataLayout>
//           <UserHomeLayout>{page}</UserHomeLayout>
//         </UserDataLayout>
//       </UserLayout>
//     </MainLayout>
//   </ProtectedLayout>
// );

// CopyTradeFeature.js
import React, { useState, useEffect } from 'react';
import useSmartContract from '@lib/hooks/useSmartContract'; // Assuming useSmartContract is in the same directory
import { AnimatePresence } from 'framer-motion';
import { query, where } from 'firebase/firestore';
import { useCollection } from '@lib/hooks/useCollection';
import { tweetsCollection } from '@lib/firebase/collections';
import { useUser } from '@lib/context/user-context';
import { mergeData } from '@lib/merge';
import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { SEO } from '@components/common/seo';
import { UserDataLayout } from '@components/layout/user-data-layout';
import { UserHomeLayout } from '@components/layout/user-home-layout';
import { Tweet } from '@components/tweet/tweet';
import { Loading } from '@components/ui/loading';
import { StatsEmpty } from '@components/tweet/stats-empty';
import type { ReactElement, ReactNode } from 'react';
import { Button } from '@components/ui/button';
import { useAccount, useBalance } from 'wagmi';
import { useAuth } from '@lib/context/web3-auth-context';

export default function UserMedia() {
  const { user } = useUser();
  const { address } = useAccount();
  useEffect(() => {
    console.log('here is the add ', address);
  }, [address]);
  const { data: balanceData, isLoading } = useBalance({
    address: address
  });

  useEffect(() => {
    // You can do something with the balance data here if needed
    console.log('here is the bal ', balanceData);
  }, [balanceData]);

  if (isLoading) {
    return <Loading />; // Your loading component
  }

  if (!balanceData?.value) {
    return (
      <StatsEmpty
        title={`No coins found in @${user?.username}'s wallet`}
        description='When they do, those Coins will show up here.'
      />
    );
  }

  // Format balance for display
  const formattedBalance = balanceData.formatted;

  // Function to return the correct icon based on the symbol
  const getSymbolIcon = (symbol) => {
    const iconStyle = { width: '64px', height: '64px' };

    const icons = {
      ETH: 'https://img.icons8.com/external-dygo-kerismaker/48/external-Etherum-cryprocurrency-dygo-kerismaker.png',
      BTC: 'https://img.icons8.com/external-filled-outline-perfect-kalash/64/external-bitcoin-currency-and-cryptocurrency-signs-free-filled-outline-perfect-kalash.png',
      LTC: 'https://img.icons8.com/external-filled-outline-perfect-kalash/64/external-coin-currency-and-cryptocurrency-signs-free-filled-outline-perfect-kalash-3.png'
      // Add more symbol-URL pairs as needed
    };

    const iconUrl = icons[symbol];
    return iconUrl ? (
      <img src={iconUrl} alt={symbol} style={iconStyle} />
    ) : null;
  };

  return (
    <section>
      {/* <h1>Wallet Balance</h1>
      <p>
        {formattedBalance} {balanceData.symbol}
      </p> */}
      <StatsEmpty
        title={`Current wallet balance is ${formattedBalance}${balanceData.symbol}`}
        description={
          <>
            {getSymbolIcon(balanceData.symbol)}
            <span>{balanceData.symbol}</span>
          </>
        }
      />
      {/* Render additional UI components to display ERC-20 and ERC-721 tokens */}
    </section>
  );
}

UserMedia.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
          <UserHomeLayout>{page}</UserHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
