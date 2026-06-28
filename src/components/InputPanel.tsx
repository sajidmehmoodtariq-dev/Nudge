// Stub — full implementation in Phase 1 Step 9
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

interface InputPanelProps {
  onSubmit: (text: string) => void;
}

/**
 * Bottom sheet with 3 tabs: Type / Paste / Speak
 * Spec: rounded top corners 20dp, handle bar 36×4dp, slide-up 220ms ease-out
 */
const InputPanel: React.FC<InputPanelProps> = ({onSubmit: _onSubmit}) => {
  return (
    <View style={styles.panel}>
      <View style={styles.handle} />
      <Text style={styles.placeholder}>Type, paste, or speak your reminder…</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...textStyles.input,
    color: colors.textLight,
  },
});

export default InputPanel;
