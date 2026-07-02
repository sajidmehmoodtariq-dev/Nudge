import {ChevronLeft, Info, Github, Globe, Heart} from 'lucide-react-native';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking} from 'react-native';

import {colors, spacing, textStyles} from '@theme';

const AboutScreen: React.FC<any> = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Info color={colors.primary} size={48} />
          </View>
          <Text style={styles.appName}>Nudge</Text>
          <Text style={styles.version}>Version 0.0.1 (Beta)</Text>
        </View>

        <Text style={styles.description}>
          Nudge is your personal AI-powered reminder assistant. It intercepts the moments you want
          to remember, without making you open an app. Just speak, type, or paste, and Nudge figures
          out the rest!
        </Text>

        <View style={styles.linksContainer}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://github.com')}>
            <View style={styles.linkIconWrapper}>
              <Github color={colors.textMain} size={22} />
            </View>
            <Text style={styles.linkText}>View Source on GitHub</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://example.com')}>
            <View style={styles.linkIconWrapper}>
              <Globe color={colors.textMain} size={22} />
            </View>
            <Text style={styles.linkText}>Visit our Website</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with </Text>
          <Heart color={colors.danger} size={16} fill={colors.danger} />
          <Text style={styles.footerText}> by the Nudge Team</Text>
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
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...textStyles.title,
    color: colors.textMain,
    fontWeight: '800',
    fontSize: 32,
    marginBottom: 4,
  },
  version: {
    ...textStyles.bodyMedium,
    color: colors.primaryLight,
    fontWeight: '600',
    letterSpacing: 1,
  },
  description: {
    ...textStyles.bodyLarge,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  linksContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  linkIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  linkText: {
    ...textStyles.bodyLarge,
    color: colors.textMain,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 72,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.textSub,
  },
});

export default AboutScreen;
