// Stub — full implementation in Phase 1 Step 12
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import type {Reminder} from '@reminders/types';
import {colors, spacing, textStyles} from '@theme';

interface ReminderCardProps {
  reminder: Reminder;
  onPress?: () => void;
}

/**
 * White surface card, 10dp radius, left accent strip (3dp wide, colors.primary), elevation 2
 */
const ReminderCard: React.FC<ReminderCardProps> = ({reminder, onPress}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <Text style={styles.label}>{reminder.label}</Text>
        <Text style={styles.time}>{new Date(reminder.datetime).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  accent: {
    width: 3,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  label: {
    ...textStyles.label,
    color: colors.textMain,
  },
  time: {
    ...textStyles.caption,
    color: colors.textSub,
    marginTop: spacing.xs,
  },
});

export default ReminderCard;
