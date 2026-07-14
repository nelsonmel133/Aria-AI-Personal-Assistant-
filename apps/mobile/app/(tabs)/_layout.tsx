import { Tabs } from "expo-router";
import { useTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: "IBMPlexMono-Regular" },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <TabIcon name="chat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <TabIcon name="tasks" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => <TabIcon name="notes" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

import { View } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

function TabIcon({ name, color }: { name: string; color: string }) {
  const props = { stroke: color, strokeWidth: 1.5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "chat")
    return <Svg width={20} height={20} viewBox="0 0 16 16"><Path d="M2 2h12v9H9l-3 3v-3H2z" {...props} /></Svg>;
  if (name === "tasks")
    return <Svg width={20} height={20} viewBox="0 0 16 16"><Rect x="2" y="2" width="12" height="12" rx="2" {...props} /><Path d="M5 8l2 2 4-4" {...props} /></Svg>;
  if (name === "notes")
    return <Svg width={20} height={20} viewBox="0 0 16 16"><Path d="M4 2h8a1 1 0 011 1v10l-3-2H4a1 1 0 01-1-1V3a1 1 0 011-1z" {...props} /><Path d="M5 6h6M5 9h4" {...props} /></Svg>;
  return <Svg width={20} height={20} viewBox="0 0 16 16"><Circle cx="8" cy="8" r="2.5" {...props} /><Path d="M8 1v2M8 13v2M1 8h2M13 8h2" {...props} /></Svg>;
}
