import {Settings as SettingsIcon, Bell} from 'lucide-react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  AppState,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Reanimated, {FadeIn, FadeOut} from 'react-native-reanimated';

import {BubbleService} from '@bubble';
import {ReminderCard} from '@components';
import {colors, spacing, textStyles} from '@theme';

import * as reminderService from '../reminders/reminderService';
import type {Reminder} from '../reminders/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Tab = 'Upcoming' | 'Completed';

const HomeScreen: React.FC<any> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchReminders = useCallback(async () => {
    try {
      const data =
        activeTab === 'Upcoming'
          ? await reminderService.getAll()
          : await reminderService.getCompleted();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setReminders(data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    }
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReminders();
    setRefreshing(false);
  };

  const checkPermission = useCallback(async () => {
    const granted = await BubbleService.hasOverlayPermission();
    setHasPermission(granted);
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    checkPermission();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermission();
        fetchReminders();
      }
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      fetchReminders();
    });

    return () => {
      subscription.remove();
      unsubscribeFocus();
    };
  }, [checkPermission, fetchReminders, navigation]);

  const handleToggleDone = async (id: string) => {
    await reminderService.markDone(id);
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    await reminderService.deleteReminder(id);
    fetchReminders();
  };

  const renderEmptyState = () => (
    <Reanimated.View entering={FadeIn.delay(200)} exiting={FadeOut} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconGlow}>
          <Bell color={colors.primary} size={36} strokeWidth={2} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>No reminders yet</Text>
      <Text style={styles.emptySubtitle}>Tap the floating Nudge bubble to quickly add one.</Text>
    </Reanimated.View>
  );

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.title}>Nudge</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <SettingsIcon color={colors.textMain} size={24} />
        </TouchableOpacity>
      </View>

      {/* Permission Banner */}
      {!hasPermission && (
        <TouchableOpacity
          style={styles.banner}
          onPress={() => BubbleService.requestOverlayPermission()}>
          <Text style={styles.bannerText}>
            ⚠️ Display over other apps permission disabled. Tap to enable.
          </Text>
        </TouchableOpacity>
      )}

      {/* Pill Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('Upcoming')}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
            onPress={() => setActiveTab('Completed')}
            activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === 'Completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={reminders}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, reminders.length === 0 && styles.listEmpty]}
        renderItem={({item}) => (
          <ReminderCard reminder={item} onToggleDone={handleToggleDone} onDelete={handleDelete} />
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  title: {
    ...textStyles.title,
    color: colors.textMain,
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  banner: {
    backgroundColor: colors.warning + '30',
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  bannerText: {
    ...textStyles.bodyMedium,
    color: colors.warning,
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.border, // Highlight color inside pill
  },
  tabText: {
    ...textStyles.bodyMedium,
    fontWeight: '600',
    color: colors.textSub,
  },
  activeTabText: {
    color: colors.textMain,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: 100, // padding for bottom scrolling
  },
  listEmpty: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: -100,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
  },
  emptyIconGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  emptyTitle: {
    ...textStyles.h2,
    color: colors.textMain,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.bodyMedium,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;
