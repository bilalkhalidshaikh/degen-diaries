import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ALCHEMY_API_KEY = '0Q87pln29m9iiiNjp2DeW8EFa1xQrvQ6';
const ALCHEMY_API_URL = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`;

export function useTokenBalances() {
  const { address } = useAccount();
  const [erc20Balances, setErc20Balances] = useState(null);
  const [erc721Balances, setErc721Balances] = useState(null);

  useEffect(() => {
    if (address) {
      const fetchErc20Balances = async () => {
        try {
          const response = await axios.get(
            `${ALCHEMY_API_URL}/getTokenBalances`,
            {
              params: { address }
            }
          );
          setErc20Balances(response.data.tokenBalances);
        } catch (error) {
          console.error('Error fetching ERC-20 token balances:', error);
        }
      };

      const fetchErc721Balances = async () => {
        try {
          const response = await axios.get(`${ALCHEMY_API_URL}/getNFTs`, {
            params: { owner: address }
          });
          setErc721Balances(response.data.ownedNfts);
        } catch (error) {
          console.error('Error fetching ERC-721 token balances:', error);
        }
      };

      fetchErc20Balances();
      fetchErc721Balances();
    }
  }, [address]);

  return { erc20Balances, erc721Balances };
}
