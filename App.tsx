import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter} from 'react-native';

import {BottomSheet, InputPanel} from '@components';
import {HomeScreen, ConfirmScreen, SettingsScreen, PermissionScreen} from '@screens';
import {colors} from '@theme';

import {BubbleService} from './src/bubble/BubbleService';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenPermissionScreen');
        if (hasSeen === 'true') {
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
      setIsSheetVisible(true);
    });

    return () => {
      listener.remove();
    };
  }, []);

  if (initialRoute === null) {
    return <></>; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {backgroundColor: colors.surface},
          headerTintColor: colors.textMain,
          headerShadowVisible: false,
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
      <BottomSheet isVisible={isSheetVisible} onClose={() => setIsSheetVisible(false)}>
        <InputPanel
          onSubmit={() => {
            setIsSheetVisible(false);
          }}
        />
      </BottomSheet>
    </NavigationContainer>
  );
}

export default App;
