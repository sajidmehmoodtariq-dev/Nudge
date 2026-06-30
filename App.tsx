import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, LogBox} from 'react-native';

LogBox.ignoreLogs([
  '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method',
]);

import {BottomSheet, InputPanel} from '@components';
import {HomeScreen, ConfirmScreen, SettingsScreen, PermissionScreen} from '@screens';
import {colors} from '@theme';

import {BubbleService} from './src/bubble/BubbleService';
import {parseReminder} from './src/parser';
import type {ParseResult} from './src/parser/types';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [launchedFromBubble, setLaunchedFromBubble] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasPermission = await BubbleService.hasOverlayPermission();
        if (hasPermission) {
          setInitialRoute('Home');
          BubbleService.show();
        } else {
          setInitialRoute('Permission');
        }
      } catch (error) {
        setInitialRoute('Permission');
      }
    }
    checkFirstLaunch();

    const listener = DeviceEventEmitter.addListener('onBubbleTap', () => {
      setLaunchedFromBubble(true);
      setParseResult(null);
      setIsSheetVisible(true);
    });

    return () => {
      listener.remove();
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
    <NavigationContainer>
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
          <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Nudge'}} />
          <Stack.Screen name="Confirm" component={ConfirmScreen} options={{title: 'Confirm'}} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
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
  );
}

export default App;
