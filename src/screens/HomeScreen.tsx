// Stub — full implementation in Phase 1 Step 12
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
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
});

export default HomeScreen;
