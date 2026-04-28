import { useGroupStore } from "@/store/useGroupStore";
import { theme, globalStyles } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddMember() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const router = useRouter();
  const addMember = useGroupStore((state) => state.addMember);
  const removeMember = useGroupStore((state) => state.removeMember);
  const group = useGroupStore((state) => state.groups.find((g) => g.id === id));

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;

    const exists = group?.members.some(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase(),
    );

    if (exists) {
      Alert.alert("Duplicate", "A member with this name already exists");
      return;
    }

    addMember(id, name.trim());
    setName("");
  }, [name, group, addMember, id]);

  const handleRemove = useCallback(
    (memberId: string, memberName: string) => {
      Alert.alert(
        "Remove Member",
        `Remove ${memberName} from the group? Any expenses they're part of will also be removed.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeMember(id, memberId),
          },
        ],
      );
    },
    [id, removeMember],
  );

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.title}>Add Members</Text>
        <Text style={[globalStyles.body, { marginTop: 6, marginBottom: 28 }]}>
          Add people to split expenses with
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={theme.colors.textMuted}
            style={[globalStyles.input, { flex: 1 }]}
            autoFocus
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleAdd}
            style={[styles.addButton, !name.trim() && styles.buttonDisabled]}
            disabled={!name.trim()}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        {group && group.members.length > 0 && (
          <View style={styles.membersList}>
            <Text style={styles.memberCount}>
              {group.members.length} member
              {group.members.length !== 1 ? "s" : ""} added
            </Text>
            {group.members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  onPress={() => handleRemove(member.id, member.name)}
                  hitSlop={8}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.back()} style={globalStyles.button}>
          <Text style={globalStyles.buttonText}>
            Done{group?.members.length ? ` (${group.members.length})` : ""}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  membersList: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    color: theme.colors.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "500",
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: "700",
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
