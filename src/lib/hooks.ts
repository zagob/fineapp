import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, getTypeTransactions } from "@/actions/transactions.actions";
import { getCategories } from "@/actions/categories.actions";
import { getBanks } from "@/actions/banks.actions";
import { toast } from "sonner";

// Hook otimizado para transações
export const useTransactions = (date: Date) => {
  return useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook otimizado para transações por tipo
export const useTransactionsByType = (date: Date, type: "INCOME" | "EXPENSE") => {
  return useQuery({
    queryKey: ["transactions", type, date],
    queryFn: async () => await getTypeTransactions({ date, type }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook otimizado para categorias
export const useCategories = (type?: "INCOME" | "EXPENSE") => {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => await getCategories({ type: type as "INCOME" | "EXPENSE" }),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });
};

// Hook otimizado para bancos
export const useBanks = () => {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

// Hook para invalidação de cache
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateTransactions: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    invalidateBanks: () => {
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};

// Hook para mutations com feedback
export const useOptimisticMutation = <T>(
  mutationFn: (data: T) => Promise<unknown>,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["banks"] });
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      options?.onSuccess?.();
    },
    onError: (error) => {
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }
      
      options?.onError?.(error);
    },
  });
}; 