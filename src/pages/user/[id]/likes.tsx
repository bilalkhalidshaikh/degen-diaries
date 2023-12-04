// import { AnimatePresence } from 'framer-motion';
// import { query, where, orderBy } from 'firebase/firestore';
// import { useCollection } from '@lib/hooks/useCollection';
// import { tweetsCollection } from '@lib/firebase/collections';
// import { useUser } from '@lib/context/user-context';
// import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
// import { MainLayout } from '@components/layout/main-layout';
// import { SEO } from '@components/common/seo';
// import { UserDataLayout } from '@components/layout/user-data-layout';
// import { UserHomeLayout } from '@components/layout/user-home-layout';
// import { Tweet } from '@components/tweet/tweet';
// import { Loading } from '@components/ui/loading';
// import { useTokenBalances } from '@lib/hooks/useTokenBalances'; // Adjust the path as necessary
// import { StatsEmpty } from '@components/tweet/stats-empty';
// import TokenList from '@components/tweet/TokenList';
// import type { ReactElement, ReactNode } from 'react';

// export default function UserLikes(): JSX.Element {
//   const { user } = useUser();

//   const { id, name, username } = user ?? {};

//   const { data, loading } = useCollection(
//     query(
//       tweetsCollection,
//       where('userLikes', 'array-contains', id),
//       orderBy('createdAt', 'desc')
//     ),
//     { includeUser: true, allowNull: true }
//   );

//   return (
//     <section>
//       {/* <SEO
//         title={`Tweets liked by ${name as string} (@${
//           username as string
//         }) / Twitter`}
//       />
//       {loading ? (
//         <Loading className='mt-5' />
//       ) : !data ? (
//         <StatsEmpty
//           title={`@${username as string} hasn't liked any Tweets`}
//           description='When they do, those Tweets will show up here.'
//         />
//       ) : (
//         <AnimatePresence mode='popLayout'>
//           {data.map((tweet) => (
//             <Tweet {...tweet} key={tweet.id} />
//           ))}
//         </AnimatePresence>
//       )} */}
//       <StatsEmpty
//         title={`This wallet does not has any Coins yet`}
//         description='When they do, those Coins will show up here.'
//       />
//     </section>
//   );
// }

// UserLikes.getLayout = (page: ReactElement): ReactNode => (
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

// import { AnimatePresence } from 'framer-motion';
// import { query, where, orderBy } from 'firebase/firestore';
// import { useCollection } from '@lib/hooks/useCollection';
// import { tweetsCollection } from '@lib/firebase/collections';
// import { useUser } from '@lib/context/user-context';
// import { UserLayout, ProtectedLayout } from '@components/layout/common-layout';
// import { MainLayout } from '@components/layout/main-layout';
// import { SEO } from '@components/common/seo';
// import { UserDataLayout } from '@components/layout/user-data-layout';
// import { UserHomeLayout } from '@components/layout/user-home-layout';
// import { Tweet } from '@components/tweet/tweet';
// import { Loading } from '@components/ui/loading';
// import { StatsEmpty } from '@components/tweet/stats-empty';
// import TokenList from '@components/tweet/TokenList';
// import type { ReactElement, ReactNode } from 'react';
// import { useAccount, useBalance } from 'wagmi';
// import React, { useState, useEffect } from 'react';

// export default function UserLikes(): JSX.Element {
//   const { user } = useUser();
//   const { address } = useAccount();
//   useEffect(() => {
//     console.log('here is the add ', address);
//   }, [address]);
//   const { data: balanceData, isLoading } = useBalance({
//     address: address
//   });

//   useEffect(() => {
//     // You can do something with the balance data here if needed
//     console.log('here is the bal ', balanceData);
//   }, [balanceData]);

//   if (isLoading) {
//     return <Loading />; // Your loading component
//   }

//   if (!balanceData?.value) {
//     return (
//       <StatsEmpty
//         title={`${user?.username} doesn't have any coins yet.`}
//         description='When they do, those Coins will show up here.'
//       />
//     );
//   }

//   // Format balance for display
//   const formattedBalance = balanceData.formatted;

//   return (
//     <section>
//       <h1>Wallet Coins</h1>
//       <p>
//         {formattedBalance} {balanceData.symbol}
//       </p>
//       {/* Render additional UI components to display ERC-20 and ERC-721 tokens */}
//     </section>
//   );
// }

// UserLikes.getLayout = (page: ReactElement): ReactNode => (
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

export default function UserLikes() {
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

  if (!balanceData?.value) {
    return (
      <StatsEmpty
        title={`No coins found in @${user?.username}'s wallet`}
        description='When they do, those Coins will show up here.'
      />
    );
  }

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

UserLikes.getLayout = (page: ReactElement): ReactNode => (
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
