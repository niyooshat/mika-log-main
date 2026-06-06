import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';

const ROSE   = '#d4849b';
const MUTED  = '#b09a8a';
const BG     = '#fdf6ee';
const BORDER = '#e8ddd0';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 6;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ROSE,
        tabBarInactiveTintColor: MUTED,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [styles.tabBar, { paddingBottom: bottomPadding, height: 62 + bottomPadding }],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="flower-tulip-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-heart" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookshelf" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-heart-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: BG,
    borderTopWidth: 1.5,
    borderTopColor: BORDER,
    height: 62,
    shadowColor: '#6b5040',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 6,
  },
  tabBarItem: {
    paddingVertical: 6,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.3,
  },
});
