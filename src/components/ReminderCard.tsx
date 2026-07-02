import {Trash2, CheckCircle2, Circle} from 'lucide-react-native';
import React, {useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Swipeable, TouchableOpacity} from 'react-native-gesture-handler';
import Reanimated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';

import {colors, spacing, textStyles} from '@theme';

import type {Reminder} from '../reminders/types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({reminder, onToggleDone, onDelete}) => {
  const isCompleted = reminder.isCompleted === 1;
  const swipeableRef = useRef<Swipeable>(null);

  // Micro-animations
  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {damping: 15, stiffness: 200});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  // Format date/time
  const dt = new Date(reminder.datetime);
  const formattedDateTime = dt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const iconScale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(reminder.id);
        }}>
        <Animated.View style={{transform: [{scale: iconScale}]}}>
          <Trash2 color="#ffffff" size={24} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}>
      <Reanimated.View style={[styles.cardWrapper, cardStyle]}>
        <View style={styles.card}>
          <View style={styles.content}>
            <View style={styles.statusIndicatorWrapper}>
              <View
                style={[
                  styles.statusDot,
                  isCompleted ? styles.statusDotCompleted : styles.statusDotUpcoming,
                ]}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.label, isCompleted && styles.labelCompleted]} numberOfLines={2}>
                {reminder.label}
              </Text>
              <Text style={styles.datetime}>{formattedDateTime}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => onToggleDone(reminder.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}>
              {isCompleted ? (
                <View style={styles.checkedCircle}>
                  <CheckCircle2 color={colors.accent} size={26} strokeWidth={2.5} />
                </View>
              ) : (
                <Circle color={colors.border} size={26} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Reanimated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  statusIndicatorWrapper: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotUpcoming: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  statusDotCompleted: {
    backgroundColor: colors.border,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  label: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 6,
  },
  labelCompleted: {
    color: colors.textSub,
    textDecorationLine: 'line-through',
  },
  datetime: {
    ...textStyles.caption,
    color: colors.textSub,
    fontWeight: '500',
  },
  checkboxContainer: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: spacing.sm,
    marginRight: spacing.lg,
    borderRadius: 20,
  },
});
