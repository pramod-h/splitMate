import { globalStyles, theme } from "@/constants/theme";
import { useGroupStore } from "@/store/useGroupStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SUGGESTIONS = [
  { label: "Trip", emoji: "✈️" },
  { label: "Roommates", emoji: "🏠" },
  { label: "Dinner", emoji: "🍽️" },
  { label: "Party", emoji: "🎉" },
  { label: "Road Trip", emoji: "🚗" },
  { label: "Vacation", emoji: "🏖️" },
];

export default function CreateGroup() {
  const [name, setName] = useState("");
  const router = useRouter();
  const addGroup = useGroupStore((state) => state.addGroup);

  const handleCreate = () => {
    if (!name.trim()) return;
    const groupId = addGroup(name.trim());
    router.replace(`/group/${groupId}`);
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={globalStyles.title}>New Group</Text>
        <Text style={[globalStyles.body, { marginTop: 6, marginBottom: 32 }]}>
          Create a group to track shared expenses
        </Text>

        <Text style={styles.label}>Group Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Trip to Goa, Roommates..."
          placeholderTextColor={theme.colors.textMuted}
          style={[globalStyles.input, styles.nameInput]}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />

        <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>
          Quick suggestions
        </Text>
        <View style={styles.chips}>
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s.label}
              style={({ pressed }) => [
                styles.chip,
                name === s.label && styles.chipActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setName(s.label)}
            >
              <Text style={styles.chipEmoji}>{s.emoji}</Text>
              <Text
                style={[
                  styles.chipText,
                  name === s.label && styles.chipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleCreate}
          style={[globalStyles.button, !name.trim() && styles.buttonDisabled]}
          disabled={!name.trim()}
        >
          <Text style={globalStyles.buttonText}>Create Group</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  nameInput: {
    fontSize: 17,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  chipActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  chipEmoji: {
    fontSize: 15,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
