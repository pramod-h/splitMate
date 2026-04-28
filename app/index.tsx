import { globalStyles, theme } from "@/constants/theme";
import { useGroupStore } from "@/store/useGroupStore";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AVATAR_COLORS = [
  "#10B981",
  "#818CF8",
  "#FCD34D",
  "#F87171",
  "#C084FC",
  "#22D3EE",
  "#FB923C",
];

type EnrichedGroup = ReturnType<
  typeof useGroupStore.getState
>["groups"][number] & {
  totalExpenses: number;
  avatarColor: string;
  isSettled: boolean;
  hasPending: boolean;
};

function GroupCard({
  item,
  onPress,
}: {
  item: EnrichedGroup;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={styles.groupCard}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 350 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 350 });
        }}
      >
        {/* Left accent bar */}
        <View
          style={[styles.accentBar, { backgroundColor: item.avatarColor }]}
        />

        {/* Avatar */}
        <View
          style={[
            styles.groupAvatar,
            { backgroundColor: item.avatarColor + "1A" },
          ]}
        >
          <Text style={[styles.groupAvatarText, { color: item.avatarColor }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={globalStyles.caption}>
            {item.members.length} member{item.members.length !== 1 ? "s" : ""}
            {item.expenses.length > 0
              ? ` · ${item.expenses.length} expense${item.expenses.length !== 1 ? "s" : ""}`
              : ""}
          </Text>
        </View>

        {/* Right: amount + status */}
        <View style={styles.groupRight}>
          <Text
            style={
              item.totalExpenses > 0 ? styles.groupTotal : styles.groupTotalEmpty
            }
          >
            ₹{item.totalExpenses.toFixed(2)}
          </Text>
          {item.isSettled && (
            <View style={styles.settledBadge}>
              <Text style={styles.settledBadgeText}>Settled</Text>
            </View>
          )}
          {item.hasPending && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
            </View>
          )}
          {!item.isSettled && !item.hasPending && item.expenses.length === 0 && (
            <Text style={styles.chevron}>›</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const groups = useGroupStore((state) => state.groups);
  const getBalances = useGroupStore((state) => state.getBalances);
  const router = useRouter();

  const enrichedGroups = useMemo<EnrichedGroup[]>(
    () =>
      groups.map((group, index) => {
        const totalExpenses = group.expenses.reduce(
          (sum, e) => sum + e.amount,
          0,
        );
        let pendingCount = 0;
        if (group.expenses.length > 0 && group.members.length > 0) {
          const bals = getBalances(group.id);
          bals.forEach((b) => {
            if (Math.abs(b) > 0.01) pendingCount++;
          });
        }
        return {
          ...group,
          totalExpenses,
          avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
          isSettled: group.expenses.length > 0 && pendingCount === 0,
          hasPending: pendingCount > 0,
        };
      }),
    [groups, getBalances],
  );

  const grandTotal = useMemo(
    () => enrichedGroups.reduce((sum, g) => sum + g.totalExpenses, 0),
    [enrichedGroups],
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>SplitMate</Text>
          <Text style={styles.headerMeta}>
            {groups.length === 0
              ? "Create your first group below"
              : `${groups.length} group${groups.length !== 1 ? "s" : ""} · ₹${grandTotal.toFixed(2)} total`}
          </Text>
        </View>
        {groups.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{groups.length}</Text>
          </View>
        )}
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconRing}>
            <Text style={styles.emptyEmoji}>💸</Text>
          </View>
          <Text style={[globalStyles.subtitle, { marginTop: theme.spacing.md }]}>
            No groups yet
          </Text>
          <Text
            style={[globalStyles.body, { textAlign: "center", marginTop: 6 }]}
          >
            Tap + to create a group and start{"\n"}splitting expenses with
            friends
          </Text>
        </View>
      ) : (
        <FlatList
          data={enrichedGroups}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GroupCard
              item={item}
              onPress={() => router.push(`/group/${item.id}`)}
            />
          )}
        />
      )}

      <Pressable
        style={globalStyles.fab}
        onPress={() => router.push("/create-group")}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  headerMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingBottom: 110,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    gap: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingVertical: 14,
    ...theme.shadows.card,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  groupAvatarText: {
    fontSize: 18,
    fontWeight: "800",
  },
  groupInfo: {
    flex: 1,
    gap: 4,
  },
  groupName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  groupRight: {
    alignItems: "flex-end",
    gap: 5,
    flexShrink: 0,
  },
  groupTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  groupTotalEmpty: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  settledBadge: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warningSoft,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.warning + "30",
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.warning,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  emptyIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 44,
  },
  fabIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "300",
    lineHeight: 32,
  },
});
