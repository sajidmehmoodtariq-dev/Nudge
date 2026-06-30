import {useState, useCallback} from 'react';
import {NativeModules} from 'react-native';

const {Bubble} = NativeModules;

export const BubbleService = {
  hasOverlayPermission(): Promise<boolean> {
    return Bubble?.hasOverlayPermission() ?? Promise.resolve(false);
  },
  requestOverlayPermission(): void {
    Bubble?.requestOverlayPermission();
  },
  show(): void {
    Bubble?.showBubble();
  },
  hide(): void {
    Bubble?.hideBubble();
  },
  updateState(showBadge: boolean): void {
    Bubble?.updateBubbleState(showBadge);
  },
  moveToBackground(): void {
    Bubble?.moveToBackground();
  },
};

export function useBubble() {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => {
    BubbleService.show();
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    BubbleService.hide();
    setIsVisible(false);
  }, []);

  return {show, hide, isVisible};
}
