import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors } from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TestsScreen from '../screens/TestsScreen';
import ResultsScreen from '../screens/ResultsScreen';
import SpecialistsScreen from '../screens/SpecialistsScreen';
import ShopScreen from '../screens/ShopScreen';
import WebTestScreen from '../screens/WebTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TestsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TestsList"
        component={TestsScreen}
        options={{ title: 'Vision Tests' }}
      />
      <Stack.Screen
        name="WebTest"
        component={WebTestScreen}
        options={{ title: 'Test' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Tests"
          component={TestsStack}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👁️</Text>,
            tabBarLabel: 'Tests',
          }}
        />
        <Tab.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
            tabBarLabel: 'Results',
          }}
        />
        <Tab.Screen
          name="Specialists"
          component={SpecialistsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏥</Text>,
            tabBarLabel: 'Specialists',
          }}
        />
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🛍️</Text>,
            tabBarLabel: 'Shop',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

