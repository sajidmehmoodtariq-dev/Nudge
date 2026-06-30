import DateTimePicker from '@react-native-community/datetimepicker';
import {CheckCircle, AlertTriangle} from 'lucide-react-native';
import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, NativeModules} from 'react-native';

import type {ParseResult} from '../parser/types';
import {insertReminder} from '../services/Database';
import {scheduleReminderNotification} from '../services/Notifications';

// Define the route params type
type ConfirmScreenProps = {
  route: {
    params: {
      result: ParseResult;
    };
  };
  navigation: any;
};

const {Bubble} = NativeModules;

export default function ConfirmScreen({route, navigation}: ConfirmScreenProps) {
  const {result} = route.params;
  const isUrdu = result.language === 'URDU_SCRIPT';

  const [datetime, setDatetime] = useState<Date>(
    result.datetime ? new Date(result.datetime) : new Date(),
  );

  const [showDatePicker, setShowDatePicker] = useState(result.confidence === 'none');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDatetime(selectedDate);
      // Immediately show time picker after date is picked
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDatetime(selectedTime);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      // 1. Save to SQLite
      const reminderId = await insertReminder(result.label, datetime, result.language);

      // 2. Schedule Notification
      await scheduleReminderNotification(result.label, datetime, reminderId);

      // 3. Play Success Animation via Native Module
      if (Bubble && Bubble.playSuccessAnimation) {
        Bubble.playSuccessAnimation();
      }

      // 4. Close the panel by navigating back and then moving to background
      navigation.goBack();
      if (Bubble && Bubble.moveToBackground) {
        Bubble.moveToBackground();
      }
    } catch (e) {
      console.error('Failed to save reminder:', e);
    }
  }, [result, datetime, navigation]);

  const handleCancel = () => {
    navigation.goBack();
    if (Bubble && Bubble.moveToBackground) {
      Bubble.moveToBackground();
    }
  };

  // Format date/time
  const formattedDateTime = datetime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {result.confidence === 'high' ? (
          <CheckCircle color="#10B981" size={48} strokeWidth={2.5} /> // MINT
        ) : (
          <AlertTriangle color="#F59E0B" size={48} strokeWidth={2.5} /> // AMBER
        )}
      </View>

      <Text
        style={[
          styles.label,
          isUrdu && {textAlign: 'right', fontFamily: 'NotoNastaliqUrdu-Regular'}, // Fallback for Urdu script
        ]}>
        {result.label}
      </Text>

      <Text style={[styles.datetime, isUrdu && {textAlign: 'right'}]}>{formattedDateTime}</Text>

      <Text style={[styles.originalText, isUrdu && {textAlign: 'right'}]}>
        "{result.originalText}"
      </Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit time</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datetime}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={datetime}
          mode="time"
          display="clock"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  datetime: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  originalText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  editButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginBottom: 48,
  },
  editButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
  },
  cancelButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4F46E5', // Indigo
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
