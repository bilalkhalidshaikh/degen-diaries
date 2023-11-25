/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useMemo } from 'react';
import cn from 'clsx';
import { manageRetweet, manageLike } from '@lib/firebase/utils';
import { ViewTweetStats } from '@components/view/view-tweet-stats';
import { TweetOption } from './tweet-option';
import { TweetShare } from './tweet-share';
import type { Tweet } from '@lib/types/tweet';
import { useTokenBalances } from '@lib/hooks/useTokenBalances'; // Adjust the path as necessary
import { Modal } from '@components/modal/modal'; // Assuming this is the correct import path
import { useModal } from '@lib/hooks/useModal';

type TweetStatsProps = Pick<
  Tweet,
  'userLikes' | 'userRetweets' | 'userReplies'
> & {
  reply?: boolean;
  userId: string;
  isOwner: boolean;
  tweetId: string;
  viewTweet?: boolean;
  openModal?: () => void;
};

export function TweetStats({
  reply,
  userId,
  isOwner,
  tweetId,
  userLikes,
  viewTweet,
  userRetweets,
  userReplies: totalReplies,
  openModal
}: TweetStatsProps): JSX.Element {
  const totalLikes = userLikes.length;
  const totalTweets = userRetweets.length;

  const [{ currentReplies, currentTweets, currentLikes }, setCurrentStats] =
    useState({
      currentReplies: totalReplies,
      currentLikes: totalLikes,
      currentTweets: totalTweets
    });

  useEffect(() => {
    setCurrentStats({
      currentReplies: totalReplies,
      currentLikes: totalLikes,
      currentTweets: totalTweets
    });
  }, [totalReplies, totalLikes, totalTweets]);

  const replyMove = useMemo(
    () => (totalReplies > currentReplies ? -25 : 25),
    [totalReplies]
  );

  const likeMove = useMemo(
    () => (totalLikes > currentLikes ? -25 : 25),
    [totalLikes]
  );

  const tweetMove = useMemo(
    () => (totalTweets > currentTweets ? -25 : 25),
    [totalTweets]
  );

  const tweetIsLiked = userLikes.includes(userId);
  const tweetIsRetweeted = userRetweets.includes(userId);

  const isStatsVisible = !!(totalReplies || totalTweets || totalLikes);

  // Use your custom hook to get token balances
  const { erc20Balances, erc721Balances } = useTokenBalances();
  // Define state for showing the modal
  const [showBalancesModal, setShowBalancesModal] = useState(false);
  const { open, closeModal } = useModal(); // Assuming you have a similar hook for controlling the modal state
  const [showCoinsModal, setShowCoinsModal] = useState(false);

  const handleOpenCoinsModal = () => {
    setShowCoinsModal(true);
  };

  const handleCloseCoinsModal = () => {
    setShowCoinsModal(false);
  };
  const handleCoinClick = (event) => {
    if (event) {
      event.stopPropagation();
    }
    // openModal(); // This function should set the state to open the modal
    handleOpenCoinsModal();
    console.log('ERC-20 Balances:', erc20Balances);
    console.log('ERC-721 Balances:', erc721Balances);
  };

  return (
    <>
      {viewTweet && (
        <ViewTweetStats
          likeMove={likeMove}
          userLikes={userLikes}
          tweetMove={tweetMove}
          replyMove={replyMove}
          userRetweets={userRetweets}
          currentLikes={currentLikes}
          currentTweets={currentTweets}
          currentReplies={currentReplies}
          isStatsVisible={isStatsVisible}
        />
      )}
      <div
        className={cn(
          'flex text-light-secondary inner:outline-none dark:text-dark-secondary',
          viewTweet ? 'justify-around py-2' : 'max-w-md justify-between'
        )}
      >
        <TweetOption
          className='hover:text-accent-blue focus-visible:text-accent-blue'
          iconClassName='group-hover:bg-accent-blue/10 group-active:bg-accent-blue/20 
                         group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-accent-blue/80'
          tip='Reply'
          move={replyMove}
          stats={currentReplies}
          iconName='ChatBubbleOvalLeftIcon'
          viewTweet={viewTweet}
          onClick={openModal}
          disabled={reply}
        />
        <TweetOption
          className={cn(
            'hover:text-accent-green focus-visible:text-accent-green',
            tweetIsRetweeted && 'text-accent-green [&>i>svg]:[stroke-width:2px]'
          )}
          iconClassName='group-hover:bg-accent-green/10 group-active:bg-accent-green/20
                         group-focus-visible:bg-accent-green/10 group-focus-visible:ring-accent-green/80'
          tip={tweetIsRetweeted ? 'Undo Retweet' : 'Retweet'}
          move={tweetMove}
          stats={currentTweets}
          iconName='ArrowPathRoundedSquareIcon'
          viewTweet={viewTweet}
          onClick={manageRetweet(
            tweetIsRetweeted ? 'unretweet' : 'retweet',
            userId,
            tweetId
          )}
        />
        <TweetOption
          className={cn(
            'hover:text-accent-pink focus-visible:text-accent-pink',
            tweetIsLiked && 'text-accent-pink [&>i>svg]:fill-accent-pink'
          )}
          iconClassName='group-hover:bg-accent-pink/10 group-active:bg-accent-pink/20
                         group-focus-visible:bg-accent-pink/10 group-focus-visible:ring-accent-pink/80'
          tip={tweetIsLiked ? 'Unlike' : 'Like'}
          move={likeMove}
          stats={currentLikes}
          iconName='HeartIcon'
          viewTweet={viewTweet}
          onClick={manageLike(
            tweetIsLiked ? 'unlike' : 'like',
            userId,
            tweetId
          )}
        />
        {/* Add the Coin TweetOption here */}
        <TweetOption
          className='hover:text-accent-yellow focus-visible:text-accent-yellow'
          iconClassName='group-hover:bg-accent-yellow/10 group-active:bg-accent-yellow/20 
                         group-focus-visible:bg-accent-yellow/10 group-focus-visible:ring-accent-yellow/80'
          tip='This Wallet does not have any Coins yet.'
          // tip=''
          iconName='CurrencyDollarIcon' // Replace with your desired coin icon
          onClick={(event) => handleCoinClick(event)}
        />

        {/* // Render the modal conditionally */}
        <Modal
          open={showCoinsModal}
          closeModal={handleCloseCoinsModal}
          modalClassName='max-w-md mx-auto p-8 rounded-lg shadow bg-[#111827] text-white'
        >
          <div className='modal-content  text-white'>
            {/* Display ERC-20 and ERC-721 token balances here */}
            {/* Modal content */}
            <div>
              {erc20Balances && erc20Balances.length > 0 ? (
                <div>
                  <h3 className='text-lg font-medium leading-6 text-white'>
                    ERC-20 Token Balances:
                  </h3>
                  <ul className='mt-2'>
                    {erc20Balances.map((token) => (
                      <li key={token.contractAddress} className='py-1'>
                        {token.tokenName}: {token.balance}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className='text-white'>
                  This wallet doesn't have any ERC-20 tokens yet.
                </p>
              )}

              {erc721Balances && erc721Balances.length > 0 ? (
                <div className='mt-4'>
                  <h3 className='text-lg font-medium leading-6 text-white'>
                    ERC-721 Tokens:
                  </h3>
                  <ul className='mt-2'>
                    {erc721Balances.map((nft) => (
                      <li key={nft.tokenId} className='py-1'>
                        {nft.tokenName} - Token ID: {nft.tokenId}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className='mt-4 text-white'>
                  This wallet doesn't have any ERC-721 tokens yet.
                </p>
              )}
            </div>

            <div className='mt-4'>
              <button
                type='button'
                className='inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                onClick={() => handleCloseCoinsModal()}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
        {/* // Render the modal conditionally */}
        <TweetShare userId={userId} tweetId={tweetId} viewTweet={viewTweet} />
        {isOwner && (
          <TweetOption
            className='hover:text-accent-blue focus-visible:text-accent-blue'
            iconClassName='group-hover:bg-accent-blue/10 group-active:bg-accent-blue/20 
                           group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-accent-blue/80'
            tip='Analytics'
            iconName='ChartPieIcon'
            disabled
          />
        )}
      </div>
    </>
  );
}
