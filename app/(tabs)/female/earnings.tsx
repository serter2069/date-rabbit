import { View, Text } from "react-native";
import { colors } from "@/lib/theme";

export default function EarningsScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontFamily: "PlusJakartaSans-SemiBold", fontSize: 18 }}>
        Earnings
      </Text>
    </View>
  );
}
