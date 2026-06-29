// Stub — full implementation in Phase 1 Step 12
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, AppState} from 'react-native';

import {BubbleService} from '@bubble';
import {colors, spacing, textStyles} from '@theme';

const HomeScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(true); // assume true to avoid flicker

  const checkPermission = async () => {
    const granted = await BubbleService.hasOverlayPermission();
    setHasPermission(granted);
  };

  useEffect(() => {
    checkPermission();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      {!hasPermission && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => BubbleService.requestOverlayPermission()}>
          <Text style={styles.bannerText}>
            ⚠️ Display over other apps permission disabled. Tap to enable.
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>Nudge</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...textStyles.title,
    color: colors.textMain,
  },
  banner: {
    backgroundColor: colors.warning,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...textStyles.bodyMedium,
    color: colors.textMain,
  },
});

export default HomeScreen;
