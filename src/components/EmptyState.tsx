import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={styles.title}>No reminders yet</Text>
      <Text style={styles.subtitle}>Tap the bubble to add your first reminder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emoji: {
    ...textStyles.title,
    // override just the size for the emoji — keep it as a theme extension
    fontSize: 48,
    lineHeight: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.heading,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSub,
    textAlign: 'center',
  },
});

export default EmptyState;
