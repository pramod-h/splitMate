import { useGroupStore } from "@/store/useGroupStore";
import { theme, globalStyles } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Settlements() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroupStore((state) => state.groups.find((g) => g.id === id));
  const getSettlements = useGroupStore((state) => state.getSettlements);
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

  const settlements = useMemo(
    () => (group ? getSettlements(id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group?.expenses, group?.members],
  );

  if (!group) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <Text style={globalStyles.subtitle}>Group not found</Text>
      </View>
    );
  }

  const getMemberName = (memberId: string) =>
    group.members.find((m) => m.id === memberId)?.name ?? "Unknown";

  return (
    <View style={globalStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryValue}>₹{totalExpenses.toFixed(2)}</Text>
          <Text style={globalStyles.caption}>
            Split between {group.members.length}{" "}
            {group.members.length === 1 ? "person" : "people"}
          </Text>
        </View>

        {/* Individual balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Balances</Text>
          <View style={styles.card}>
            {group.members.map((member, index) => {
              const balance = balances.get(member.id) ?? 0;
              const isSettled = Math.abs(balance) < 0.01;
              const isPositive = balance > 0;
              return (
                <View
                  key={member.id}
                  style={[
                    styles.balanceRow,
                    index < group.members.length - 1 && styles.rowBorder,
                  ]}
                >
                  <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.memberName}>{member.name}</Text>
                  </View>
                  <View style={styles.balanceRight}>
                    <Text
                      style={[
                        styles.balanceAmount,
                        {
                          color: isSettled
                            ? theme.colors.textMuted
                            : isPositive
                              ? theme.colors.positive
                              : theme.colors.negative,
                        },
                      ]}
                    >
                      {isSettled
                        ? "—"
                        : `${isPositive ? "+" : ""}₹${balance.toFixed(2)}`}
                    </Text>
                    <Text style={globalStyles.caption}>
                      {isSettled ? "settled" : isPositive ? "gets back" : "owes"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Suggested payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Payments</Text>
          {settlements.length === 0 ? (
            <View style={styles.allSettledCard}>
              <Text style={styles.allSettledIcon}>✅</Text>
              <Text
                style={[
                  globalStyles.subtitle,
                  { marginTop: theme.spacing.sm },
                ]}
              >
                All settled up!
              </Text>
              <Text
                style={[
                  globalStyles.body,
                  { textAlign: "center", marginTop: 4 },
                ]}
              >
                No payments needed
              </Text>
            </View>
          ) : (
            <View style={styles.settlementsList}>
              {settlements.map((s, index) => {
                const fromName = getMemberName(s.from);
                const toName = getMemberName(s.to);
                return (
                  <View key={index} style={styles.settlementCard}>
                    <View style={styles.flowRow}>
                      <View style={styles.personBadgeDebtor}>
                        <Text
                          style={[
                            styles.personInitial,
                            { color: theme.colors.negative },
                          ]}
                        >
                          {fromName.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.arrowContainer}>
                        <Text style={styles.settlementAmt}>
                          ₹{s.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.arrow}>→</Text>
                      </View>

                      <View style={styles.personBadgeCreditor}>
                        <Text
                          style={[
                            styles.personInitial,
                            { color: theme.colors.positive },
                          ]}
                        >
                          {toName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.settlementDesc}>
                      <Text style={styles.settlementName}>{fromName}</Text>
                      <Text style={{ color: theme.colors.textSecondary }}>
                        {" "}
                        pays{" "}
                      </Text>
                      <Text style={styles.settlementName}>{toName}</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: 48,
    gap: theme.spacing.xl,
  },
  centered: { alignItems: "center", justifyContent: "center" },

  summaryCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.primary + "CC",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 42,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: -1,
  },

  section: { gap: theme.spacing.sm },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: theme.spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
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
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "500",
  },
  balanceRight: { alignItems: "flex-end", gap: 2 },
  balanceAmount: {
    fontSize: 15,
    fontWeight: "700",
  },

  allSettledCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  allSettledIcon: { fontSize: 44 },

  settlementsList: { gap: theme.spacing.md },
  settlementCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    width: "100%",
    justifyContent: "center",
  },
  personBadgeDebtor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.negative + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  personBadgeCreditor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.positive + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  personInitial: {
    fontSize: 20,
    fontWeight: "700",
  },
  arrowContainer: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  settlementAmt: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  arrow: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  settlementDesc: {
    fontSize: 14,
  },
  settlementName: {
    fontWeight: "700",
    color: theme.colors.text,
  },
});
