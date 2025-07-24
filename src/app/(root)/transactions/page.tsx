"use client";

import { getTransactions } from "@/actions/transactions.actions";
import { getDeletedTransactions } from "@/actions/transactions.actions.soft-delete";
import { ExportTransactions } from "@/components/ExportTransactions";
import { FilterDate } from "@/components/FilterDate";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { SelectBanksTransaction } from "@/components/SelectBanksTransaction";
import { SelectEveryCategories } from "@/components/SelectEveryCategories";
import TrashBin from "@/components/TrashBin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDateStore, useTransactionStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Trash2 } from "lucide-react";
import { RechartExpense, VisualAnalysisPanel } from "./RechartExpense";
import { TransactionsByDateModern } from "./TransactionsByDate";

// Componente original (mantido para comparação)
export function TransactionsPageLegacy() {
  const date = useDateStore((state) => state.date);
  const {
    typeTransaction,
    setTypeTransaction,
    category,
    setCategory,
    bank,
    setBank,
  } = useTransactionStore();

  const { data, isPending } = useQuery({
    queryKey: ["transactions", date, typeTransaction, category, bank],
    queryFn: async () => {
      const { transactionsByDate, resume } = await getTransactions({
        date,
        type: typeTransaction ?? undefined,
        categoryId: category.length > 0 ? category : undefined,
        bankId: !bank || bank.length === 0 ? undefined : bank,
      });

      return { transactionsByDate, resume };
    },
  });

  // Buscar transações deletadas para a lixeira
  const { data: deletedTransactionsData } = useQuery({
    queryKey: ["deleted-transactions"],
    queryFn: async () => {
      // Aqui precisamos do userId, vamos buscar de forma simples
      const response = await fetch("/api/transactions/deleted");
      if (response.ok) {
        return response.json();
      }
      return { success: true, data: [] };
    },
  });

  const deletedTransactions = deletedTransactionsData?.data || [];

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-8">
        <div>
          <h1>Transações Geral</h1>
          <p className="text-xs text-neutral-500">
            Essa página é uma visão geral de todas as transações do mês
          </p>

          <div className="flex gap-4 mt-4">
            <RegisterTransactionDialog type="INCOME" />
            <RegisterTransactionDialog type="EXPENSE" />

            <ExportTransactions />
            
            <TrashBin
              title="Lixeira de Transações"
              description="Gerencie transações que foram movidas para a lixeira"
              items={deletedTransactions}
              onRestore={async (id) => {
                const response = await fetch("/api/transactions/restore", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                return response.json();
              }}
              onHardDelete={async (id) => {
                const response = await fetch("/api/transactions/hard-delete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id }),
                });
                return response.json();
              }}
              renderItem={(transaction) => (
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  <div>
                    <p className="font-medium">
                      {transaction.description || "Sem descrição"}
                    </p>
                    <p className={`text-sm font-semibold ${
                      transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(transaction.value / 100)}
                    </p>
                  </div>
                </div>
              )}
              emptyMessage="Nenhuma transação foi deletada"
            />
          </div>
        </div>

        <div className="">
          <h1 className="leading-relaxed">Filtros</h1>
          <p className="text-xs text-neutral-500">
            Utilize os filtros abaixo para filtrar as transações
          </p>

          <div className="flex items-center gap-4 mt-4">
            <FilterDate />

            <div className="flex items-center gap-px">
              <Select
                value={typeTransaction ?? ""}
                onValueChange={(value) =>
                  setTypeTransaction(value as "INCOME" | "EXPENSE" | undefined)
                }
              >
                <SelectTrigger
                  className="dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 w-[170px]"
                  size="sm"
                >
                  <SelectValue placeholder="selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="INCOME">Entradas</SelectItem>
                    <SelectItem value="EXPENSE">Saídas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="cursor-pointer"
                hidden={typeTransaction === undefined}
                size="sm"
                onClick={() => setTypeTransaction(undefined)}
              >
                <X className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-px">
              <SelectEveryCategories
                defaultValue={category}
                onValueChange={setCategory}
              />
              <Button
                className="cursor-pointer"
                hidden={category === ""}
                size="sm"
                onClick={() => setCategory("")}
              >
                <X className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-px">
              <SelectBanksTransaction value={bank} onChange={setBank} />
              <Button
                className="cursor-pointer"
                hidden={bank === ""}
                size="sm"
                onClick={() => setBank("")}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="text-2xl text-neutral-400 capitalize">
          {format(date, "MMMM 'de ' yyyy", { locale: ptBR })}
        </h1>

        <div className="flex gap-4">
          <TransactionsByDate
            date={date}
            isLoading={isPending}
            transactionsByDate={data?.transactionsByDate ?? []}
          />

          <RechartExpense
            type={typeTransaction}
            totalValue={
              typeTransaction === "INCOME"
                ? data?.resume?.totalIncome
                : data?.resume?.totalExpense
            }
          />
        </div>
      </div>
    </div>
  );
}

// Novo componente com layout moderno
export function TransactionsPageModern() {
  const date = useDateStore((state) => state.date);
  const {
    typeTransaction,
    setTypeTransaction,
    category,
    setCategory,
    bank,
    setBank,
  } = useTransactionStore();

  const { data, isPending } = useQuery({
    queryKey: ["transactions", date, typeTransaction, category, bank],
    queryFn: async () => {
      const { transactionsByDate, resume } = await getTransactions({
        date,
        type: typeTransaction ?? undefined,
        categoryId: category.length > 0 ? category : undefined,
        bankId: !bank || bank.length === 0 ? undefined : bank,
      });

      return { transactionsByDate, resume };
    },
  });

  // Buscar transações deletadas para a lixeira
  const { data: deletedTransactionsData } = useQuery({
    queryKey: ["deleted-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions/deleted");
      if (response.ok) {
        return response.json();
      }
      return { success: true, data: [] };
    },
  });

  const deletedTransactions = deletedTransactionsData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 p-6">
      {/* Header Moderno com Glassmorphism */}
      <div className="mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-3">
                Transações Financeiras
              </h1>
              <p className="text-neutral-300 text-lg">
                Gerencie e visualize todas as suas transações do mês de {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <RegisterTransactionDialog type="INCOME" />
              <RegisterTransactionDialog type="EXPENSE" />
              <ExportTransactions />
              <TrashBin
                title="Lixeira"
                description="Transações deletadas"
                items={deletedTransactions}
                onRestore={async (id) => {
                  const response = await fetch("/api/transactions/restore", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });
                  return response.json();
                }}
                onHardDelete={async (id) => {
                  const response = await fetch("/api/transactions/hard-delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });
                  return response.json();
                }}
                renderItem={(transaction) => (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium text-white">
                        {transaction.description || "Sem descrição"}
                      </p>
                      <p className={`text-sm font-semibold ${
                        transaction.type === "INCOME" ? "text-green-400" : "text-red-400"
                      }`}>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(transaction.value / 100)}
                      </p>
                    </div>
                  </div>
                )}
                emptyMessage="Nenhuma transação foi deletada"
              />
            </div>
          </div>

          {/* Filtros Modernos com Design Elegante */}
          <div className="bg-gradient-to-r from-neutral-800/30 to-neutral-700/30 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Filtros Avançados</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Período
                </label>
                <div className="bg-neutral-800/50 rounded-lg border border-neutral-600/50">
                  <FilterDate />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tipo
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={typeTransaction ?? ""}
                    onValueChange={(value) =>
                      setTypeTransaction(value as "INCOME" | "EXPENSE" | undefined)
                    }
                  >
                    <SelectTrigger className="bg-neutral-800/50 border-neutral-600/50 text-white hover:bg-neutral-700/50 transition-colors">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-600">
                      <SelectGroup>
                        <SelectItem value="INCOME" className="hover:bg-neutral-700">Entradas</SelectItem>
                        <SelectItem value="EXPENSE" className="hover:bg-neutral-700">Saídas</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {typeTransaction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTypeTransaction(undefined)}
                      className="text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categoria
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-800/50 border border-neutral-600/50 rounded-lg">
                    <SelectEveryCategories
                      defaultValue={category}
                      onValueChange={setCategory}
                    />
                  </div>
                  {category && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategory("")}
                      className="text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Banco
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-800/50 border border-neutral-600/50 rounded-lg">
                    <SelectBanksTransaction value={bank} onChange={setBank} />
                  </div>
                  {bank && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBank("")}
                      className="text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Principal - 3 Colunas com Design Moderno */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Central - Transações */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Lista de Transações</h2>
                  <p className="text-neutral-400">Visualize e gerencie suas transações</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TransactionsByDateModern
                date={date}
                isLoading={isPending}
                transactionsByDate={data?.transactionsByDate ?? []}
              />
            </div>
          </div>
        </div>

        {/* Coluna Direita - Gráficos e Estatísticas */}
        <div className="space-y-8">
          {/* Análise Visual */}
          <VisualAnalysisPanel
            type={typeTransaction}
            totalValue={
              typeTransaction === "INCOME"
                ? data?.resume?.totalIncome
                : data?.resume?.totalExpense
            }
          />

          {/* Resumo Rápido */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Resumo do Mês</h2>
                  <p className="text-neutral-400">Visão geral financeira</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-neutral-300 font-medium">Receitas</span>
                </div>
                <span className="text-green-400 font-bold text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format((data?.resume?.totalIncome || 0) / 100)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-neutral-300 font-medium">Despesas</span>
                </div>
                <span className="text-red-400 font-bold text-lg">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format((data?.resume?.totalExpense || 0) / 100)}
                </span>
              </div>
              
              <div className="border-t border-neutral-700/50 pt-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-neutral-300 font-medium">Balanço</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    (data?.resume?.balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format((data?.resume?.balance || 0) / 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal - escolha qual versão usar
export default function Page() {
  // Para alternar entre as versões, mude esta linha:
  return <TransactionsPageModern />;
  // return <TransactionsPageLegacy />;
}
