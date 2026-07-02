import AsyncStorage from '@react-native-async-storage/async-storage';
import {Clock, RefreshCw, Volume2, Info, ChevronRight, EyeOff} from 'lucide-react-native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  NativeModules,
  ScrollView,
} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

const SOUND_KEY = '@nudge_settings_sound';
const DEFAULT_TIME_KEY = '@nudge_settings_default_time';

const SettingsScreen: React.FC<any> = ({navigation}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultTime, setDefaultTime] = useState('17:00');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const sound = await AsyncStorage.getItem(SOUND_KEY);
        if (sound !== null) {
          setSoundEnabled(sound === 'true');
        }

        const time = await AsyncStorage.getItem(DEFAULT_TIME_KEY);
        if (time !== null) {
          setDefaultTime(time);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const toggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await AsyncStorage.setItem(SOUND_KEY, String(value));
  };

  const handleResetBubble = () => {
    if (NativeModules.Bubble) {
      NativeModules.Bubble.showBubble();
      console.log('Called showBubble from native modules');
    }
  };

  const handleHideBubble = () => {
    if (NativeModules.Bubble) {
      NativeModules.Bubble.hideBubble();
      console.log('Called hideBubble from native modules');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.cardGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, {backgroundColor: colors.primary + '20'}]}>
                <Clock color={colors.primary} size={22} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Default Reminder Time</Text>
                <Text style={styles.settingDescription}>If no time is detected</Text>
              </View>
            </View>
            <View style={styles.rightAction}>
              <Text style={styles.settingValue}>{defaultTime}</Text>
              <ChevronRight color={colors.border} size={20} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.settingItem, styles.settingItemNoBorder]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, {backgroundColor: colors.accent + '20'}]}>
                <Volume2 color={colors.accent} size={22} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notification Sound</Text>
                <Text style={styles.settingDescription}>Play sound on alerts</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{false: colors.border, true: colors.primary}}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bubble Overlay</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.settingItem} onPress={handleResetBubble}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, {backgroundColor: colors.warning + '20'}]}>
                <RefreshCw color={colors.warning} size={22} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Reset Bubble Position</Text>
                <Text style={styles.settingDescription}>Move bubble back to screen center</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemNoBorder]}
            onPress={handleHideBubble}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, {backgroundColor: colors.danger + '20'}]}>
                <EyeOff color={colors.danger} size={22} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Hide Bubble Overlay</Text>
                <Text style={styles.settingDescription}>
                  Temporarily remove it until next launch
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemNoBorder]}
            onPress={() => navigation.navigate('About')}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, {backgroundColor: colors.primary + '20'}]}>
                <Info color={colors.primary} size={22} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>About Nudge</Text>
                <Text style={styles.settingDescription}>Version 0.0.1 (Beta)</Text>
              </View>
            </View>
            <ChevronRight color={colors.border} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  backButton: {
    padding: spacing.xs,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...textStyles.h2,
    color: colors.textMain,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...textStyles.caption,
    color: colors.textSub,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  cardGroup: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  settingItemNoBorder: {
    borderBottomWidth: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 70,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 4,
  },
  settingDescription: {
    ...textStyles.caption,
    color: colors.textSub,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...textStyles.bodyMedium,
    color: colors.textSub,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default SettingsScreen;
