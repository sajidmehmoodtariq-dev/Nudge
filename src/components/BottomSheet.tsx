import React, {useEffect, useCallback} from 'react';
import {View, Modal, StyleSheet, Dimensions, Pressable, ScrollView} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import {colors} from '@theme';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({isVisible, onClose, children}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const animateIn = useCallback(() => {
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, translateY]);

  const animateOut = useCallback(() => {
    opacity.value = withTiming(0, {
      duration: 220,
      easing: Easing.in(Easing.ease),
    });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      {
        duration: 220,
        easing: Easing.in(Easing.ease),
      },
      finished => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  }, [opacity, translateY, onClose]);

  useEffect(() => {
    if (isVisible) {
      animateIn();
    }
  }, [isVisible, animateIn]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  // If it's completely closed and not visible, don't render the Modal
  if (!isVisible && translateY.value === SCREEN_HEIGHT) {
    return null;
  }

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={animateOut}>
      <View style={styles.container}>
        {/* Background Overlay */}
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={styles.pressableOverlay} onPress={animateOut} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View style={[styles.sheet, sheetStyle]}>
          {/* Top Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000066',
  },
  pressableOverlay: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.6,
    position: 'absolute',
    bottom: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
});
