import { useGroupStore } from "@/store/useGroupStore";
import { theme, globalStyles } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddExpense() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const group = useGroupStore((state) => state.groups.find((g) => g.id === id));
  const addExpense = useGroupStore((state) => state.addExpense);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [splitBetween, setSplitBetween] = useState<string[]>([]);

  const toggleSplit = useCallback((memberId: string) => {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((mid) => mid !== memberId)
        : [...prev, memberId],
    );
  }, []);

  const selectAllMembers = useCallback(() => {
    setSplitBetween(group?.members.map((m) => m.id) ?? []);
  }, [group?.members]);

  if (!group) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <Text style={globalStyles.subtitle}>Group not found</Text>
      </View>
    );
  }

  const parsedAmount = parseFloat(amount);
  const isValid =
    description.trim() &&
    parsedAmount > 0 &&
    paidBy !== null &&
    splitBetween.length > 0;

  const splitPreviewAmount =
    splitBetween.length > 0 && parsedAmount > 0
      ? (parsedAmount / splitBetween.length).toFixed(2)
      : null;

  const handleAdd = () => {
    if (!isValid || !paidBy) return;
    addExpense(id, description.trim(), parsedAmount, paidBy, splitBetween);
    router.back();
  };

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
        <Text style={globalStyles.title}>Add Expense</Text>
        <Text style={[globalStyles.body, { marginTop: 6, marginBottom: 24 }]}>
          Record a shared expense
        </Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Dinner, groceries, Uber, etc."
          placeholderTextColor={theme.colors.textMuted}
          style={globalStyles.input}
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.amountInput}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Paid by</Text>
        <View style={styles.chipGrid}>
          {group.members.map((member) => (
            <Pressable
              key={member.id}
              style={[
                styles.memberChip,
                paidBy === member.id && styles.memberChipSelected,
              ]}
              onPress={() => setPaidBy(member.id)}
            >
              <Text
                style={[
                  styles.memberChipText,
                  paidBy === member.id && styles.memberChipTextSelected,
                ]}
              >
                {member.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            globalStyles.spaceBetween,
            { marginTop: 20, marginBottom: 10 },
          ]}
        >
          <Text style={styles.label}>Split between</Text>
          <Pressable onPress={selectAllMembers}>
            <Text style={styles.selectAll}>Select all</Text>
          </Pressable>
        </View>
        <View style={styles.chipGrid}>
          {group.members.map((member) => (
            <Pressable
              key={member.id}
              style={[
                styles.memberChip,
                splitBetween.includes(member.id) && styles.memberChipSelected,
              ]}
              onPress={() => toggleSplit(member.id)}
            >
              <Text
                style={[
                  styles.memberChipText,
                  splitBetween.includes(member.id) &&
                    styles.memberChipTextSelected,
                ]}
              >
                {member.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {splitPreviewAmount !== null && (
          <View style={styles.splitPreview}>
            <Text style={styles.splitPreviewAmount}>₹{splitPreviewAmount}</Text>
            <Text style={styles.splitPreviewLabel}>
              per person · {splitBetween.length}{" "}
              {splitBetween.length === 1 ? "person" : "people"}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleAdd}
          style={[globalStyles.button, !isValid && styles.buttonDisabled]}
          disabled={!isValid}
        >
          <Text style={globalStyles.buttonText}>Add Expense</Text>
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
    paddingBottom: 32,
  },
  centered: { alignItems: "center", justifyContent: "center" },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  currencySymbol: {
    fontSize: 22,
    color: theme.colors.textMuted,
    marginRight: 4,
    fontWeight: "500",
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    paddingVertical: 14,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  memberChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  memberChipSelected: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  memberChipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  memberChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  selectAll: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  splitPreview: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
    alignItems: "center",
    gap: 4,
  },
  splitPreviewAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  splitPreviewLabel: {
    fontSize: 13,
    color: theme.colors.primary + "AA",
    fontWeight: "500",
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
