// Stub — full implementation in Phase 1 Step 8
// Depends on: BubbleModule.kt native module

import {NativeModules} from 'react-native';

const {Bubble} = NativeModules;

/**
 * JS wrapper around the native BubbleModule (Kotlin).
 * Requires SYSTEM_ALERT_WINDOW permission before calling show().
 */
export const BubbleService = {
  show(): void {
    Bubble?.show();
  },
  hide(): void {
    Bubble?.hide();
  },
};
