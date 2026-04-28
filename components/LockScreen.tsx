import { useAuthStore } from "@/store/useAuthStore";
import { theme } from "@/constants/theme";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export function LockScreen() {
  const { isLoading, biometricType, authenticate, checkBiometricSupport } =
    useAuthStore();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (!isLoading && biometricType) {
      authenticate();
    }
  }, [isLoading, biometricType]);

  const getBiometricLabel = () => {
    switch (biometricType) {
      case "facial":
        return "Face ID";
      case "fingerprint":
        return "Touch ID";
      case "iris":
        return "Iris";
      default:
        return "Biometric";
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case "facial":
        return "🔓";
      case "fingerprint":
        return "👆";
      default:
        return "🔐";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.ringOuter}>
          <View style={styles.ringMiddle}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💰</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>SplitMate</Text>
        <Text style={styles.subtitle}>Your finances, secured</Text>

        <Pressable
          style={({ pressed }) => [
            styles.unlockButton,
            pressed && { opacity: 0.75 },
          ]}
          onPress={authenticate}
        >
          <Text style={styles.unlockIcon}>{getBiometricIcon()}</Text>
          <Text style={styles.unlockText}>
            Unlock with {getBiometricLabel()}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  ringOuter: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  ringMiddle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: theme.colors.primary + "18",
    borderWidth: 1,
    borderColor: theme.colors.primary + "35",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.primary + "28",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 38,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  unlockIcon: {
    fontSize: 20,
  },
  unlockText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
});
