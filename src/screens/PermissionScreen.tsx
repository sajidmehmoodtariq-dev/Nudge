import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, AppState} from 'react-native';

import {BubbleService} from '@bubble';
import {colors, spacing, textStyles} from '@theme';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any; // Using any for now to simplify types
}

const PermissionScreen: React.FC<Props> = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState(false);

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

  const handleGrant = () => {
    BubbleService.requestOverlayPermission();
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasSeenPermissionScreen', 'true');
    // Replace the screen so user can't go back to permission screen
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Nudge</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>We need a special permission</Text>
        <Text style={styles.body}>
          Nudge uses a floating bubble so you can capture reminders instantly from any screen
          without switching apps.
        </Text>
        <Text style={styles.body}>
          To enable this, please tap below to go to Settings, then find Nudge and allow "Display
          over other apps".
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status:{' '}
          <Text style={{color: hasPermission ? colors.accent : colors.warning}}>
            {hasPermission ? 'Granted ✅' : 'Not Granted ❌'}
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, hasPermission && styles.buttonDisabled]}
        onPress={handleGrant}
        disabled={hasPermission}>
        <Text style={styles.buttonText}>Grant Permission</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonSecondary, {marginTop: spacing.md}]}
        onPress={handleContinue}>
        <Text style={styles.buttonTextSecondary}>
          {hasPermission ? 'Continue' : 'Skip for now'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...textStyles.title,
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  heading: {
    ...textStyles.heading,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  body: {
    ...textStyles.body,
    color: colors.textSub,
    marginBottom: spacing.md,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statusText: {
    ...textStyles.label,
    color: colors.textMain,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    ...textStyles.label,
    color: colors.surface,
  },
  buttonSecondary: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    ...textStyles.label,
    color: colors.textSub,
  },
});

export default PermissionScreen;
