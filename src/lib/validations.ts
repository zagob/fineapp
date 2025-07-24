import { z } from "zod";
import { BankName, Type } from "@prisma/client";

// Validações base
export const userIdSchema = z.string().cuid();
export const dateSchema = z.date();
export const amountSchema = z.number().positive().int();

// Validações de transações
export const createTransactionSchema = z.object({
  bank: z.string().cuid(),
  category: z.string().cuid(),
  date: dateSchema,
  value: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"] as const),
});

export const updateTransactionSchema = z.object({
  transactionId: z.string().cuid(),
  bank: z.string().cuid(),
  category: z.string().cuid(),
  date: dateSchema,
  value: z.string().min(1, "Valor é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"] as const),
});

export const getTransactionsSchema = z.object({
  date: dateSchema,
  type: z.enum(["INCOME", "EXPENSE"] as const).optional(),
  categoryId: z.string().cuid().optional(),
  bankId: z.string().cuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Validações de contas bancárias
export const createAccountSchema = z.object({
  bank: z.nativeEnum(BankName),
  description: z.string().min(1, "Descrição é obrigatória").max(100),
  amount: z.number().int().default(0),
});

export const updateAccountSchema = createAccountSchema.extend({
  id: z.string().cuid(),
});

// Validações de categorias
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50),
  type: z.nativeEnum(Type),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().cuid(),
});

// Validações de transferências
export const createTransferSchema = z.object({
  date: dateSchema,
  bankInitial: z.string().cuid(),
  bankDestine: z.string().cuid(),
  value: z.string().min(1, "Valor é obrigatório"),
}).refine((data) => data.bankInitial !== data.bankDestine, {
  message: "Bancos de origem e destino devem ser diferentes",
  path: ["bankDestine"],
});

export const updateTransferSchema = z.object({
  id: z.string().cuid(),
  date: dateSchema,
  bankInitial: z.string().cuid(),
  bankDestine: z.string().cuid(),
  value: z.string().min(1, "Valor é obrigatório"),
}).refine((data) => data.bankInitial !== data.bankDestine, {
  message: "Bancos de origem e destino devem ser diferentes",
  path: ["bankDestine"],
});

// Validações de filtros
export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine((data) => data.startDate <= data.endDate, {
  message: "Data inicial deve ser menor ou igual à data final",
  path: ["endDate"],
});

// Validações de relatórios
export const reportSchema = z.object({
  date: dateSchema,
  type: z.enum(["INCOME", "EXPENSE", "ALL"] as const).default("ALL"),
  groupBy: z.enum(["category", "bank", "day", "week", "month"] as const).default("category"),
  filters: z.object({
    categoryId: z.string().cuid().optional(),
    bankId: z.string().cuid().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
  }).optional(),
});

// Tipos exportados
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type UpdateTransferInput = z.infer<typeof updateTransferSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type ReportInput = z.infer<typeof reportSchema>; 