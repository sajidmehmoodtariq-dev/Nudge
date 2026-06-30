import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import type {SpeechResultsEvent, SpeechErrorEvent} from '@react-native-voice/voice';
import Voice from '@react-native-voice/voice';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import {colors, spacing, textStyles} from '@theme';

type Tab = 'Type' | 'Paste' | 'Speak';
const TABS: Tab[] = ['Type', 'Paste', 'Speak'];
const STORAGE_KEY = '@last_used_tab';

interface InputPanelProps {
  onSubmit: (text: string) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({onSubmit}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Type');
  const [inputText, setInputText] = useState('');
  const [clipboardContent, setClipboardContent] = useState('');
  const [showFullClipboard, setShowFullClipboard] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRecording, setIsRecording] = useState(false); // Used internally by Voice, keeping for future state needs

  const [voiceError, setVoiceError] = useState('');
  const inputRef = React.useRef<TextInput>(null);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setIsRecording(false);
      setVoiceError(e.error?.message || 'Voice not supported on this device');
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    };
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setInputText(e.value[0]);
      }
    };
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setInputText(e.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [pulseOpacity, pulseScale]);

  useEffect(() => {
    const loadLastTab = async () => {
      try {
        const savedTab = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTab && TABS.includes(savedTab as Tab)) {
          setActiveTab(savedTab as Tab);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load tab preference', error);
      }
    };
    loadLastTab();
  }, []);

  const handleTabPress = async (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'Type') {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Keyboard.dismiss();
    }

    if (tab === 'Paste') {
      const content = await Clipboard.getString();
      setClipboardContent(content);
      setInputText(content);
    } else if (tab === 'Speak') {
      setInputText('');
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, tab);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save tab preference', error);
    }
  };

  const handleClearClipboard = () => {
    setClipboardContent('');
    setInputText('');
    Clipboard.setString('');
  };

  const startRecording = async () => {
    setVoiceError('');
    setInputText('');
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setVoiceError('Audio permission denied');
        return;
      }
    }

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, {duration: 1000, easing: Easing.out(Easing.ease)}),
        withTiming(1, {duration: 0}),
      ),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 1000, easing: Easing.out(Easing.ease)}),
        withTiming(0.4, {duration: 0}),
      ),
      -1,
      false,
    );

    try {
      await Voice.start('');
      setIsRecording(true);
    } catch (e) {
      setVoiceError('Voice not supported on this device');
    }
  };

  const stopRecording = async () => {
    cancelAnimation(pulseScale);
    cancelAnimation(pulseOpacity);
    pulseScale.value = 1;
    pulseOpacity.value = 0;
    try {
      await Voice.stop();
      setIsRecording(false);
      if (inputText.trim()) {
        setTimeout(() => handleSubmit(), 400);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleSubmit = React.useCallback(() => {
    const finalContent = activeTab === 'Paste' ? clipboardContent : inputText;
    if (finalContent.trim()) {
      onSubmit(finalContent.trim());
      setInputText('');
      setClipboardContent('');
      Keyboard.dismiss();
    }
  }, [activeTab, clipboardContent, inputText, onSubmit]);

  // Debounced auto-parse
  useEffect(() => {
    const finalContent = activeTab === 'Paste' ? clipboardContent : inputText;
    if (!finalContent.trim() || activeTab === 'Paste') {
      return;
    } // Don't auto-parse on Paste
    const timeoutId = setTimeout(() => {
      // Auto-parse after 600ms of inactivity
      handleSubmit();
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [inputText, clipboardContent, activeTab, handleSubmit]);

  return (
    <View style={styles.container}>
      {/* Tab Row */}
      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(tab)}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Input / Content Area */}
      {activeTab === 'Type' ? (
        <>
          <View style={styles.inputContainer}>
            <View style={styles.inputArea}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="e.g. Call Ahmed kal sham 5 baje"
                placeholderTextColor={colors.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                autoFocus={activeTab === 'Type'}
                onSubmitEditing={handleSubmit}
              />
            </View>
            {inputText.length > 100 && (
              <Text style={styles.charCount}>{inputText.length} characters</Text>
            )}
          </View>
          <Text style={styles.hintText}>Try: tomorrow at 3pm / kal subah / nn nnn nnn nnn</Text>
        </>
      ) : activeTab === 'Paste' ? (
        <View style={styles.pasteContainer}>
          {!clipboardContent ? (
            <Text style={styles.emptyPasteText}>Nothing in clipboard yet — copy text first</Text>
          ) : (
            <View style={styles.clipboardBox}>
              <View style={styles.clipboardHeader}>
                <Text style={styles.clipboardTitle}>Clipboard Content</Text>
                <TouchableOpacity
                  onPress={handleClearClipboard}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.clipboardScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.clipboardText}>
                  {clipboardContent.length > 300 && !showFullClipboard
                    ? `${clipboardContent.slice(0, 300)}...`
                    : clipboardContent}
                </Text>
              </ScrollView>
              {clipboardContent.length > 300 && (
                <TouchableOpacity onPress={() => setShowFullClipboard(!showFullClipboard)}>
                  <Text style={styles.showMoreText}>
                    {showFullClipboard ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.speakContainer}>
          <Text style={styles.voiceText}>{inputText ? inputText : 'Hold to speak...'}</Text>
          {!!voiceError && <Text style={styles.voiceError}>{voiceError}</Text>}

          <View style={styles.micWrapper}>
            <Animated.View
              style={[styles.micPulse, {transform: [{scale: pulseScale}], opacity: pulseOpacity}]}
            />
            <TouchableOpacity
              style={styles.micButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              activeOpacity={0.8}>
              <Text style={styles.micIconText}>🎤</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          !(activeTab === 'Paste' ? clipboardContent : inputText).trim() &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!(activeTab === 'Paste' ? clipboardContent : inputText).trim()}>
        <Text style={styles.submitButtonText}>Parse</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary, // Indigo underline
  },
  tabText: {
    ...textStyles.label,
    color: colors.textLight, // Gray text for inactive
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700', // Bold for active
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputArea: {
    minHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
  },
  input: {
    ...textStyles.input,
    color: colors.textMain,
    textAlignVertical: 'top',
    textAlign: 'auto', // Supports RTL for Urdu automatically
    flex: 1,
  },
  charCount: {
    ...textStyles.caption,
    color: colors.textLight,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  hintText: {
    ...textStyles.caption,
    color: colors.textLight,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  pasteContainer: {
    marginBottom: spacing.lg,
  },
  emptyPasteText: {
    ...textStyles.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  clipboardBox: {
    backgroundColor: colors.background,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
  },
  clipboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clipboardTitle: {
    ...textStyles.label,
    color: colors.textSub,
  },
  clearText: {
    color: colors.textSub,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clipboardScroll: {
    maxHeight: 150,
  },
  clipboardText: {
    ...textStyles.body,
    color: colors.textMain,
    textAlign: 'auto',
  },
  showMoreText: {
    ...textStyles.label,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  speakContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  voiceText: {
    ...textStyles.body,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: spacing.lg,
    minHeight: 48,
    textAlignVertical: 'center',
  },
  voiceError: {
    ...textStyles.caption,
    color: colors.warning,
    marginBottom: spacing.md,
  },
  micWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  micPulse: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4ADE80', // Mint color wave
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary, // Indigo fill
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  micIconText: {
    fontSize: 32,
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    ...textStyles.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default InputPanel;
