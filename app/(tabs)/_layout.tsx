import CustomTabBar from '@/components/CustomTabBar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: 'NurAI',
          tabBarIcon: ({ color }) => <FontAwesome name="magic" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Hifz',
          tabBarIcon: ({ color }) => <FontAwesome name="shield" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <FontAwesome name="navicon" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
