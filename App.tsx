import notifee, {EventType} from '@notifee/react-native';
import 'react-native-gesture-handler';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method',
]);

import {BottomSheet, InputPanel} from '@components';
import {
  HomeScreen,
  ConfirmScreen,
  SettingsScreen,
  PermissionScreen,
  AboutScreen,
  AlarmScreen,
} from '@screens';
import {colors} from '@theme';

import {BubbleService} from './src/bubble/BubbleService';
import {
  checkPastDueReminders,
  requestNotificationPermission,
} from './src/notifications/notificationService';
import {parseReminder} from './src/parser';
import type {ParseResult} from './src/parser/types';
import {initDB} from './src/reminders/db';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef<any>();

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [initialAlarmId, setInitialAlarmId] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [launchedFromBubble, setLaunchedFromBubble] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  useEffect(() => {
    async function initApp() {
      try {
        initDB();
        await requestNotificationPermission();
        await checkPastDueReminders();

        const initialNotification = await notifee.getInitialNotification();
        if (initialNotification?.notification?.data?.isAlarm) {
          setInitialAlarmId(initialNotification.notification.data.reminderId as string);
          setInitialRoute('Alarm');
          return;
        }

        const hasPermission = await BubbleService.hasOverlayPermission();
        if (hasPermission) {
          setInitialRoute('Home');
          BubbleService.show();
        } else {
          setInitialRoute('Permission');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setInitialRoute('Permission');
      }
    }
    initApp();

    const listener = DeviceEventEmitter.addListener('onBubbleTap', () => {
      setLaunchedFromBubble(true);
      setParseResult(null);
      setIsSheetVisible(true);
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.DELIVERED || type === EventType.PRESS) {
        if (detail.notification?.data?.isAlarm) {
          const rId = detail.notification.data.reminderId as string;
          if (navigationRef.isReady()) {
            navigationRef.navigate('Alarm', {reminderId: rId});
          }
        }
      }
    });

    return () => {
      listener.remove();
      unsubscribeNotifee();
    };
  }, []);

  if (initialRoute === null) {
    return <></>; // Or a loading spinner
  }

  const handleCloseSheet = () => {
    setIsSheetVisible(false);
    setTimeout(() => setParseResult(null), 300); // clear after animation
    if (launchedFromBubble) {
      setLaunchedFromBubble(false);
      BubbleService.moveToBackground();
    }
  };

  const handleParse = (text: string) => {
    const result = parseReminder(text);
    setParseResult(result);
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer ref={navigationRef}>
        {!(isSheetVisible && launchedFromBubble) && (
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerStyle: {backgroundColor: colors.surface},
              headerTintColor: colors.textMain,
              headerShadowVisible: false,
              contentStyle: {backgroundColor: colors.background},
            }}>
            <Stack.Screen
              name="Permission"
              component={PermissionScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
            <Stack.Screen name="Confirm" component={ConfirmScreen} options={{title: 'Confirm'}} />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{title: 'Settings'}}
            />
            <Stack.Screen name="About" component={AboutScreen} options={{title: 'About'}} />
            <Stack.Screen
              name="Alarm"
              component={AlarmScreen}
              options={{headerShown: false, animation: 'fade'}}
              initialParams={initialAlarmId ? {reminderId: initialAlarmId} : undefined}
            />
          </Stack.Navigator>
        )}
        <BottomSheet isVisible={isSheetVisible} onClose={handleCloseSheet}>
          {parseResult ? (
            <ConfirmScreen
              route={{params: {result: parseResult}}}
              navigation={{goBack: handleCloseSheet}}
            />
          ) : (
            <InputPanel onSubmit={handleParse} />
          )}
        </BottomSheet>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
