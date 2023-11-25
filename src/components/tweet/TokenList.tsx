// TokenList.jsx
const TokenList = ({ tokens, title }) => {
  if (!tokens || tokens.length === 0) {
    return (
      <div className='mt-4 rounded-lg bg-gray-800 px-4 py-2 text-white shadow'>
        <h3 className='text-md font-semibold'>{title}</h3>
        <p>No tokens found in this wallet.</p>
      </div>
    );
  }

  return (
    <div className='mt-4 rounded-lg bg-gray-800 px-4 py-2 text-white shadow'>
      <h3 className='text-md font-semibold'>{title}</h3>
      <ul className='mt-2'>
        {tokens.map((token) => (
          <li
            key={token.contractAddress}
            className='border-b border-gray-700 py-1'
          >
            {token.tokenName}: {token.balance}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenList;
