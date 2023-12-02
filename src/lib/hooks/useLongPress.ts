import { useState, useEffect, useCallback } from 'react';

const useLongPress = (onLongPressMobile, onClick, { delay = 500 } = {}) => {
  return (chatId) => {
    const [startLongPress, setStartLongPress] = useState(false);

    useEffect(() => {
      let timerId;
      if (startLongPress) {
        timerId = setTimeout(() => {
          onLongPressMobile(chatId);
        }, delay);
      } else {
        clearTimeout(timerId);
      }

      return () => {
        clearTimeout(timerId);
      };
    }, [onLongPressMobile, delay, startLongPress, chatId]);

    const start = () => {
      setStartLongPress(true);
    };

    const stop = (event) => {
      if (startLongPress) {
        onLongPressMobile(chatId);
      } else {
        onClick(event);
      }
      setStartLongPress(false);
    };

    return {
      onMouseDown: start,
      onTouchStart: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchEnd: stop
    };
  };
};

export default useLongPress;
