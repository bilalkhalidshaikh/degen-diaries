import { useState, useEffect, useCallback } from 'react';

const useLongPress = (onLongPressMobile, onClick, delay = 500) => {
  const start = useCallback(
    (chatId) => {
      const timerId = setTimeout(() => {
        onLongPressMobile(chatId);
      }, delay);

      return () => {
        clearTimeout(timerId);
      };
    },
    [onLongPressMobile, delay]
  );

  const stop = useCallback(
    (event, chatId) => {
      if (event.type === 'mouseup' || event.type === 'touchend') {
        onClick(event, chatId);
      }
    },
    [onClick]
  );

  return { start, stop };
};

export default useLongPress;
