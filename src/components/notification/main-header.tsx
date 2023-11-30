// @components/notifications/MainHeader.tsx
import React from 'react';

type MainHeaderProps = {
  children: React.ReactNode;
};

const MainHeader: React.FC<MainHeaderProps> = ({ children }) => {
  return (
    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
      {children}
    </h1>
  );
};

export default MainHeader;
