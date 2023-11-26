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

export default function UserMedia(): JSX.Element {
  const { user } = useUser();
  const {
    initiateCopyTrade,
    checkCopyTradeStatus,
    loading: contractLoading
  } = useSmartContract();
  const [isCopyTradingActive, setIsCopyTradingActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCopyTradeStatus() {
      if (user?.walletAddress) {
        console.log('Checking copy trade status...');
        setLoading(true);
        try {
          const status = await checkCopyTradeStatus(user.walletAddress);
          setIsCopyTradingActive(status);
          console.log('Copy trade status:', status);
        } catch (error) {
          console.error('Failed to check copy trade status:', error);
        }
        setLoading(false);
      }
    }
    fetchCopyTradeStatus();
  }, [user?.walletAddress, checkCopyTradeStatus]);

  const handleCopyTradeToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !isCopyTradingActive;
      await initiateCopyTrade(user.walletAddress, newStatus);
      setIsCopyTradingActive(newStatus);
    } catch (error) {
      console.error('Copy trade toggling failed', error);
    }
    setLoading(false);
  };

  if (loading || contractLoading) return <Loading />;

  return (
    <section>
      <h1>Copy Trade Feature</h1>
      <Button onClick={handleCopyTradeToggle}>
        {isCopyTradingActive ? 'Disable Copy Trade' : 'Enable Copy Trade'}
      </Button>
      {isCopyTradingActive ? (
        <p>
          Copy trade is active. Your trades will be copied by your followers.
        </p>
      ) : (
        <StatsEmpty
          title='Copy trade is not currently active.'
          description='Enable the feature to allow your trades to be copied.'
        />
      )}
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
