"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  value: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  deletedAt: string | null;
}

interface SoftDeleteTestProps {
  transactions: Transaction[];
}

export default function SoftDeleteTest({ transactions }: SoftDeleteTestProps) {
  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeTransactions = localTransactions.filter(t => t.deletedAt === null);
  const deletedTransactions = localTransactions.filter(t => t.deletedAt !== null);

  const handleSoftDelete = async (id: string) => {
    setLoading(id);
    setMessage(null);
    
    try {
      const response = await fetch("/api/transactions/soft-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLocalTransactions(prev => 
          prev.map(t => 
            t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
          )
        );
        setMessage({ type: "success", text: "Transação movida para lixeira!" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao deletar transação" });
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    setLoading(id);
    setMessage(null);
    
    try {
      const response = await fetch("/api/transactions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLocalTransactions(prev => 
          prev.map(t => 
            t.id === id ? { ...t, deletedAt: null } : t
          )
        );
        setMessage({ type: "success", text: "Transação restaurada!" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao restaurar transação" });
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Soft Delete - Demonstração
          </CardTitle>
          <CardDescription>
            Teste o sistema de soft delete. As transações são marcadas como deletadas ao invés de serem removidas permanentemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`p-3 rounded-md mb-4 ${
              message.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Transações Ativas */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                Transações Ativas ({activeTransactions.length})
              </h3>
              <div className="space-y-2">
                {activeTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description || "Sem descrição"}</p>
                        <p className={`text-sm font-semibold ${
                          transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(transaction.value)}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={transaction.type === "INCOME" ? "default" : "secondary"}>
                          {transaction.type === "INCOME" ? "Receita" : "Despesa"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSoftDelete(transaction.id)}
                          disabled={loading === transaction.id}
                        >
                          {loading === transaction.id ? (
                            "Deletando..."
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {activeTransactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma transação ativa</p>
                )}
              </div>
            </div>

            {/* Transações Deletadas */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">
                Lixeira ({deletedTransactions.length})
              </h3>
              <div className="space-y-2">
                {deletedTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-3 border rounded-lg bg-gray-50 shadow-sm opacity-75"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium line-through">{transaction.description || "Sem descrição"}</p>
                        <p className={`text-sm font-semibold ${
                          transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatCurrency(transaction.value)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Deletada em: {formatDate(transaction.deletedAt!)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-gray-500">
                          Deletada
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(transaction.id)}
                          disabled={loading === transaction.id}
                        >
                          {loading === transaction.id ? (
                            "Restaurando..."
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {deletedTransactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Lixeira vazia</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações sobre Soft Delete */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Como funciona o Soft Delete?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Deletar:</strong> Marca a transação como deletada (campo deletedAt)</li>
              <li>• <strong>Restaurar:</strong> Remove a marcação de deletada (deletedAt = null)</li>
              <li>• <strong>Segurança:</strong> Dados nunca são perdidos permanentemente</li>
              <li>• <strong>Recuperação:</strong> Transações podem ser restauradas a qualquer momento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 