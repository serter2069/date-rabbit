import { Tabs } from "expo-router";
import { useWindowDimensions } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/lib/theme";

function TabIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={22} name={name} color={color} />;
}

export default function FemaleTabLayout() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          display: isMobile ? "flex" : "none",
          borderTopWidth: 1,
          borderTopColor: colors.background,
          backgroundColor: colors.surface,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color }) => <TabIcon name="inbox" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => <TabIcon name="dollar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <TabIcon name="comments" color={color} />,
        }}
      />
    </Tabs>
  );
}
