import { create } from "zustand";

interface DateStoreProps {
  date: Date;
  setDate: (date: Date) => void;
}

export const useDateStore = create<DateStoreProps>((set) => ({
  date: new Date(),
  setDate: (date: Date) => set({ date }),
}));

interface TransactionStoreProps {
  bank?: string;
  category: string;
  typeTransaction?: "INCOME" | "EXPENSE";
  setTypeTransaction: (type: "INCOME" | "EXPENSE" | undefined) => void;
  setCategory: (category: string) => void;
  setBank: (bank: string) => void;
}

export const useTransactionStore = create<TransactionStoreProps>((set) => ({
  bank: undefined,
  typeTransaction: undefined,
  category: "",
  setTypeTransaction: (type: "INCOME" | "EXPENSE" | undefined) =>
    set({ typeTransaction: type }),
  setCategory: (category: string) => set({ category }),
  setBank: (bank: string) => set({ bank }),
}));
