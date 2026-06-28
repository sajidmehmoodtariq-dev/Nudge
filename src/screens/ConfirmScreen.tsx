// Stub — full implementation in Phase 1 Step 10
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

const ConfirmScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Confirm Reminder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  label: {
    ...textStyles.heading,
    color: colors.textMain,
  },
});

export default ConfirmScreen;
