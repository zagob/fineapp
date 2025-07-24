import { $Enums } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transactions } from "./Transactions";
import { Loading } from "@/components/Loading";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, Filter, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageBank } from "@/components/ImageBank";
import { ImageCategory } from "@/components/ImageCategory";
import { RegisterTransactionDialog } from "@/components/RegisterTransactionDialog";
import { DialogDeleteTransaction } from "@/components/DeleteTransaction";

export type TransctionType = {
  id: string;
  type: $Enums.Type;
  date: Date;
  value: number;
  bank: {
    id: string;
    bank: $Enums.BankName;
  };
  category: {
    color: string;
    id: string;
    name: string;
    icon: string | null;
  };
  description: string | null;
};

interface TransactionsByDateProps {
  isLoading: boolean;
  date: Date;
  transactionsByDate: {
    date: string;
    transactions: TransctionType[];
  }[];
}

// VERSÃO ATUAL (mantida para comparação)
export const TransactionsByDate = ({
  transactionsByDate,
  isLoading,
  date,
}: TransactionsByDateProps) => {
  const isTransactionsEmpty = transactionsByDate?.length === 0;

  if (isLoading) {
    return (
      <>
        {isLoading && (
          <div className="mt-8 w-[650px]">
            <Loading />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-[650px] h-[calc(100vh-300px)] overflow-scroll mt-4 pr-4 pb-10 border-r border-r-neutral-800">
      {isTransactionsEmpty && !isLoading && (
        <div className="mt-8 text-neutral-600">
          Nenhuma transação encontrada no mês de{" "}
          {format(date, " MMMM", { locale: ptBR })}
        </div>
      )}

      {transactionsByDate?.map((transaction) => (
        <div key={transaction.date} className="mt-8 flex flex-col gap-3">
          <div>
            <p className="text-sm font-light text-neutral-300">
              {format(new Date(transaction.date + "T00:00"), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </p>

            <Transactions transactions={transaction.transactions} />
          </div>
        </div>
      ))}
    </div>
  );
};

// NOVA VERSÃO MODERNA
export const TransactionsByDateModern = ({
  transactionsByDate,
  isLoading,
  date,
}: TransactionsByDateProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"date" | "value" | "type">("date");
  const [showOnlyIncome, setShowOnlyIncome] = useState(false);
  const [showOnlyExpense, setShowOnlyExpense] = useState(false);

  const isTransactionsEmpty = transactionsByDate?.length === 0;

  // Filtrar transações
  const filteredTransactions = transactionsByDate?.map(group => ({
    ...group,
    transactions: group.transactions.filter(transaction => {
      const matchesSearch = !searchTerm || 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.bank.bank.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = (!showOnlyIncome && !showOnlyExpense) ||
        (showOnlyIncome && transaction.type === "INCOME") ||
        (showOnlyExpense && transaction.type === "EXPENSE");

      return matchesSearch && matchesType;
    })
  })).filter(group => group.transactions.length > 0);

  // Calcular estatísticas
  const totalIncome = filteredTransactions?.reduce((sum, group) => 
    sum + group.transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.value, 0), 0) || 0;
  
  const totalExpense = filteredTransactions?.reduce((sum, group) => 
    sum + group.transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.value, 0), 0) || 0;

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Receitas</p>
              <p className="text-xl font-bold text-green-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalIncome / 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Despesas</p>
              <p className="text-xl font-bold text-red-400">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalExpense / 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Transações</p>
              <p className="text-xl font-bold text-blue-400">
                {filteredTransactions?.reduce((sum, group) => sum + group.transactions.length, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Buscar por descrição, categoria ou banco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-400"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={showOnlyIncome ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowOnlyIncome(!showOnlyIncome);
                if (showOnlyIncome) setShowOnlyExpense(false);
              }}
              className={showOnlyIncome ? "bg-green-600 hover:bg-green-700" : "border-neutral-600"}
            >
              Receitas
            </Button>
            <Button
              variant={showOnlyExpense ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowOnlyExpense(!showOnlyExpense);
                if (showOnlyExpense) setShowOnlyIncome(false);
              }}
              className={showOnlyExpense ? "bg-red-600 hover:bg-red-700" : "border-neutral-600"}
            >
              Despesas
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {isTransactionsEmpty && !isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400 text-lg">
              Nenhuma transação encontrada no mês de {format(date, "MMMM", { locale: ptBR })}
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              Tente ajustar os filtros ou adicionar uma nova transação
            </p>
          </div>
        ) : filteredTransactions?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400 text-lg">
              Nenhuma transação encontrada com os filtros aplicados
            </p>
            <p className="text-neutral-500 text-sm mt-2">
              Tente ajustar os critérios de busca
            </p>
          </div>
        ) : (
          filteredTransactions?.map((group) => (
            <div key={group.date} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggleDateExpansion(group.date)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-semibold text-white">
                      {format(new Date(group.date + "T00:00"), "dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {group.transactions.length} transação{group.transactions.length !== 1 ? 'ões' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">Total do dia</p>
                    <p className="text-lg font-bold text-white">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        group.transactions.reduce((sum, t) => sum + t.value, 0) / 100
                      )}
                    </p>
                  </div>
                  {expandedDates.has(group.date) ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {expandedDates.has(group.date) && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {group.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <ImageBank bank={transaction.bank.bank} width={24} height={24} />
                        <ImageCategory
                          color={transaction.category.color}
                          icon={transaction.category.icon as string}
                          classNameBackground="size-8"
                          classNameIcon="size-4"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {transaction.description || "Sem descrição"}
                          </p>
                          <p className="text-sm text-neutral-400">
                            {transaction.category.name} • {transaction.bank.bank}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "INCOME"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "Entrada" : "Saída"}
                          </span>
                          <p
                            className={`text-lg font-bold mt-1 ${
                              transaction.type === "INCOME" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(transaction.value / 100)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <RegisterTransactionDialog
                            transactionId={transaction.id}
                            type={transaction.type}
                            actions="EDIT"
                            bankId={transaction.bank.id}
                            category={transaction.category.id}
                            description={transaction.description ?? ""}
                            value={new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(transaction.value / 100)}
                            datetime={transaction.date}
                          />
                          <RegisterTransactionDialog
                            type={transaction.type}
                            actions="COPY"
                            bankId={transaction.bank.id}
                            category={transaction.category.id}
                            description={transaction.description ?? ""}
                            value={new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(transaction.value / 100)}
                            datetime={transaction.date}
                          />
                          <DialogDeleteTransaction id={transaction.id} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
