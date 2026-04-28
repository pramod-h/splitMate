import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Expense, Group, Member } from "../types";

type GroupState = {
  groups: Group[];
  addGroup: (name: string) => string;
  deleteGroup: (groupId: string) => void;
  addMember: (groupId: string, name: string) => void;
  removeMember: (groupId: string, memberId: string) => void;
  addExpense: (
    groupId: string,
    description: string,
    amount: number,
    paidById: string,
    splitBetween: string[],
  ) => void;
  deleteExpense: (groupId: string, expenseId: string) => void;
  getBalances: (groupId: string) => Map<string, number>;
  getSettlements: (
    groupId: string,
  ) => { from: string; to: string; amount: number }[];
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],

      addGroup: (name) => {
        const newGroup: Group = {
          id: Date.now().toString(),
          name,
          members: [],
          expenses: [],
        };

        set((state) => ({
          groups: [...state.groups, newGroup],
        }));

        return newGroup.id;
      },

      deleteGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        }));
      },

      addMember: (groupId, name) => {
        const newMember: Member = {
          id: Date.now().toString(),
          name,
        };

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, members: [...g.members, newMember] } : g,
          ),
        }));
      },

      removeMember: (groupId, memberId) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id !== groupId) return g;
            const updatedExpenses = g.expenses
              .map((e) => ({
                ...e,
                splitBetween: e.splitBetween.filter((id) => id !== memberId),
              }))
              .filter(
                (e) => e.paidBy !== memberId && e.splitBetween.length > 0,
              );
            return {
              ...g,
              members: g.members.filter((m) => m.id !== memberId),
              expenses: updatedExpenses,
            };
          }),
        }));
      },

      addExpense: (groupId, description, amount, paidById, splitBetween) => {
        const newExpense: Expense = {
          id: Date.now().toString(),
          description,
          amount,
          paidBy: paidById,
          splitBetween,
        };

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, expenses: [...g.expenses, newExpense] }
              : g,
          ),
        }));
      },

      deleteExpense: (groupId, expenseId) => {
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) }
              : g,
          ),
        }));
      },

      getBalances: (groupId) => {
        const group = get().groups.find((g) => g.id === groupId);
        const balances = new Map<string, number>();

        if (!group) return balances;

        group.members.forEach((m) => balances.set(m.id, 0));

        group.expenses.forEach((expense) => {
          const splitAmount = expense.amount / expense.splitBetween.length;

          // Payer gets credit
          const currentPayerBalance = balances.get(expense.paidBy) || 0;
          balances.set(expense.paidBy, currentPayerBalance + expense.amount);

          // Each person in split owes their share
          expense.splitBetween.forEach((memberId) => {
            const currentBalance = balances.get(memberId) || 0;
            balances.set(memberId, currentBalance - splitAmount);
          });
        });

        return balances;
      },

      getSettlements: (groupId) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return [];

        const balances = get().getBalances(groupId);
        const settlements: { from: string; to: string; amount: number }[] = [];

        const debtors: { id: string; amount: number }[] = [];
        const creditors: { id: string; amount: number }[] = [];

        balances.forEach((balance, memberId) => {
          if (balance < -0.01) {
            debtors.push({ id: memberId, amount: Math.abs(balance) });
          } else if (balance > 0.01) {
            creditors.push({ id: memberId, amount: balance });
          }
        });

        // Sort for optimal settlements
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
          const debtor = debtors[i];
          const creditor = creditors[j];
          const amount = Math.min(debtor.amount, creditor.amount);

          if (amount > 0.01) {
            settlements.push({
              from: debtor.id,
              to: creditor.id,
              amount: Math.round(amount * 100) / 100,
            });
          }

          debtor.amount -= amount;
          creditor.amount -= amount;

          if (debtor.amount < 0.01) i++;
          if (creditor.amount < 0.01) j++;
        }

        return settlements;
      },
    }),
    {
      name: "splitmate-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
