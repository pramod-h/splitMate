import { globalStyles, theme } from "@/constants/theme";
import { useGroupStore } from "@/store/useGroupStore";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function TrashIcon() {
  return (
    <View style={trashStyles.container}>
      {/* Outlined handle cap */}
      <View style={trashStyles.handle} />
      {/* Wide lid bar */}
      <View style={trashStyles.lid} />
      {/* Body with two vertical stripes */}
      <View style={trashStyles.body}>
        <View style={trashStyles.stripe} />
        <View style={trashStyles.stripe} />
      </View>
    </View>
  );
}

const trashStyles = StyleSheet.create({
  container: { alignItems: "center", width: 22, height: 27 },
  handle: {
    width: 10,
    height: 5,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginBottom: -1,
  },
  lid: {
    width: 20,
    height: 4,
    backgroundColor: theme.colors.danger,
    borderRadius: 2,
    marginBottom: 1,
  },
  body: {
    width: 16,
    height: 17,
    backgroundColor: theme.colors.danger,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  stripe: {
    width: 2,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 1,
  },
});

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const group = useGroupStore((state) => state.groups.find((g) => g.id === id));
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const deleteExpense = useGroupStore((state) => state.deleteExpense);
  const getBalances = useGroupStore((state) => state.getBalances);

  const totalExpenses = useMemo(
    () => group?.expenses.reduce((sum, e) => sum + e.amount, 0) ?? 0,
    [group?.expenses],
  );

  const balances = useMemo(
    () => (group ? getBalances(id) : new Map<string, number>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group?.expenses, group?.members],
  );

  const maxAbsBalance = useMemo(() => {
    let max = 0;
    balances.forEach((b) => {
      if (Math.abs(b) > max) max = Math.abs(b);
    });
    return max || 1;
  }, [balances]);

  const getMemberName = useCallback(
    (memberId: string) =>
      group?.members.find((m) => m.id === memberId)?.name ?? "Unknown",
    [group?.members],
  );

  const handleDeleteGroup = useCallback(() => {
    Alert.alert(
      "Delete Group",
      "This will permanently delete the group and all its expenses.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGroup(id);
            router.replace("/");
          },
        },
      ],
    );
  }, [id, deleteGroup, router]);

  const handleDeleteExpense = useCallback(
    (expenseId: string) => {
      Alert.alert(
        "Delete Expense",
        "Are you sure you want to remove this expense?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteExpense(id, expenseId),
          },
        ],
      );
    },
    [id, deleteExpense],
  );

  if (!group) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <Text style={styles.notFoundIcon}>🔍</Text>
        <Text style={globalStyles.subtitle}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => (
            <Pressable
              onPress={handleDeleteGroup}
              hitSlop={10}
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
            >
              <TrashIcon />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopBar} />
          <View style={styles.heroBody}>
            <Text style={styles.heroGroupName}>{group.name}</Text>
            <Text style={styles.heroAmount}>
              ₹{totalExpenses.toFixed(2)}
            </Text>
            <Text style={styles.heroAmountLabel}>total expenses</Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{group.members.length}</Text>
                <Text style={styles.heroStatLabel}>Members</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{group.expenses.length}</Text>
                <Text style={styles.heroStatLabel}>Expenses</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text
                  style={[
                    styles.heroStatValue,
                    {
                      color:
                        group.expenses.length === 0
                          ? theme.colors.textMuted
                          : theme.colors.warning,
                    },
                  ]}
                >
                  {group.expenses.length === 0 ? "—" : "Active"}
                </Text>
                <Text style={styles.heroStatLabel}>Status</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={[globalStyles.spaceBetween, styles.sectionHeader]}>
            <Text style={styles.sectionTitle}>Members</Text>
            <Link href={`/group/${id}/add-member`} asChild>
              <Pressable style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </Pressable>
            </Link>
          </View>

          {group.members.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={globalStyles.body}>No members yet</Text>
              <Text style={globalStyles.caption}>
                Add members to start splitting
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {group.members.map((member, index) => {
                const balance = balances.get(member.id) ?? 0;
                const isPositive = balance >= 0;
                const barPercent = Math.min(
                  Math.abs(balance) / maxAbsBalance,
                  1,
                );
                return (
                  <View
                    key={member.id}
                    style={[
                      styles.memberRow,
                      index < group.members.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <View style={styles.memberTopRow}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {member.name}
                        </Text>
                        <Text
                          style={[
                            styles.memberBalance,
                            {
                              color: isPositive
                                ? theme.colors.positive
                                : theme.colors.negative,
                            },
                          ]}
                        >
                          {isPositive ? "+" : ""}₹{balance.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.balanceTrack}>
                        <View
                          style={[
                            styles.balanceFill,
                            {
                              width: `${barPercent * 100}%` as `${number}%`,
                              backgroundColor: isPositive
                                ? theme.colors.positive
                                : theme.colors.negative,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Expenses Section */}
        <View style={styles.section}>
          <View style={[globalStyles.spaceBetween, styles.sectionHeader]}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            {group.members.length >= 2 && (
              <Link href={`/group/${id}/add-expense`} asChild>
                <Pressable style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </Pressable>
              </Link>
            )}
          </View>

          {group.expenses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={globalStyles.body}>No expenses yet</Text>
              <Text style={globalStyles.caption}>
                {group.members.length < 2
                  ? "Add at least 2 members first"
                  : "Add an expense to start tracking"}
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {group.expenses.map((expense, index) => (
                <Pressable
                  key={expense.id}
                  style={({ pressed }) => [
                    styles.expenseRow,
                    index < group.expenses.length - 1 && styles.rowBorder,
                    pressed && { backgroundColor: theme.colors.surfaceLight },
                  ]}
                  onLongPress={() => handleDeleteExpense(expense.id)}
                >
                  <View style={styles.expenseIconBox}>
                    <Text>💸</Text>
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <Text style={globalStyles.caption}>
                      {getMemberName(expense.paidBy)} paid ·{" "}
                      {expense.splitBetween.length} way split
                    </Text>
                  </View>
                  <View style={styles.expenseAmountBox}>
                    <Text style={styles.expenseAmount}>
                      ₹{expense.amount.toFixed(2)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Settlements CTA */}
        {group.expenses.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.settlementsCard,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push(`/group/${id}/settlements`)}
          >
            <View style={styles.settlementsLeft}>
              <Text style={styles.settlementsIcon}>⚖️</Text>
              <View>
                <Text style={globalStyles.subtitle}>View Settlements</Text>
                <Text style={globalStyles.caption}>
                  Who owes whom, simplified
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 48,
    gap: theme.spacing.lg,
  },
  centered: { alignItems: "center", justifyContent: "center" },
  notFoundIcon: { fontSize: 48, marginBottom: theme.spacing.md },

  /* Hero Card */
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.hero,
  },
  heroTopBar: {
    height: 4,
    backgroundColor: theme.colors.primary,
  },
  heroBody: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  heroGroupName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.3,
    marginBottom: theme.spacing.sm,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: -1.5,
  },
  heroAmountLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  heroDivider: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  heroStats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  heroStat: { alignItems: "center", gap: 3 },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  heroStatLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    alignSelf: "stretch",
  },

  /* Sections */
  section: { gap: theme.spacing.sm },
  sectionHeader: { marginBottom: 2 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary + "40",
  },
  addBtnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.card,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: 4,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  /* Members */
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memberAvatarText: {
    color: theme.colors.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  memberDetails: {
    flex: 1,
    gap: 6,
  },
  memberTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberName: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "600",
    flex: 1,
  },
  memberBalance: {
    fontSize: 14,
    fontWeight: "700",
  },
  balanceTrack: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  balanceFill: {
    height: "100%",
    borderRadius: 2,
    opacity: 0.85,
  },

  /* Expenses */
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  expenseIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  expenseInfo: { flex: 1, gap: 3 },
  expenseDescription: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "600",
  },
  expenseAmountBox: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },

  /* Settlements CTA */
  settlementsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + "50",
    ...theme.shadows.glow,
  },
  settlementsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  settlementsIcon: { fontSize: 24 },
  chevron: { fontSize: 20, color: theme.colors.textMuted },

});
