import {useState, useCallback} from 'react';

import {BubbleService} from './BubbleService';

interface UseBubble {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
}

/**
 * Hook: { show, hide, isVisible }
 * Tracks bubble visibility state on the JS side.
 */
export function useBubble(): UseBubble {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    BubbleService.show();
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    BubbleService.hide();
    setIsVisible(false);
  }, []);

  return {isVisible, show, hide};
}
