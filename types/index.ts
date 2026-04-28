export type Member = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
};

export type Group = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
};
