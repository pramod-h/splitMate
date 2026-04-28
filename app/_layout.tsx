import { LockScreen } from "@/components/LockScreen";
import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <>
        <LockScreen />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: "Home" }} />
        <Stack.Screen
          name="create-group"
          options={{ title: "New Group", headerBackTitle: "Home" }}
        />
        <Stack.Screen
          name="group/[id]/index"
          options={{ title: "Group", headerBackTitle: "Home" }}
        />
        <Stack.Screen
          name="group/[id]/add-member"
          options={{ title: "Add Members" }}
        />
        <Stack.Screen
          name="group/[id]/add-expense"
          options={{ title: "Add Expense" }}
        />
        <Stack.Screen
          name="group/[id]/settlements"
          options={{ title: "Settlements" }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
