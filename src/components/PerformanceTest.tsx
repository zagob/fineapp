"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactionsImproved, getTransactionsByCategoryImproved } from "@/actions/transactions.actions.improved";
import { useDateStore } from "@/store";

export function PerformanceTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { date } = useDateStore();

  const testTransactionsPerformance = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const result = await getTransactionsImproved({
        date,
        page: 1,
        limit: 50,
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setResults({
        type: "transactions",
        success: result.success,
        duration: `${duration.toFixed(2)}ms`,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      setResults({
        type: "transactions",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const testCategoryPerformance = async () => {
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const result = await getTransactionsByCategoryImproved(date);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setResults({
        type: "categories",
        success: result.success,
        duration: `${duration.toFixed(2)}ms`,
        data: result.data,
      });
    } catch (error) {
      setResults({
        type: "categories",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🚀 Teste de Performance</CardTitle>
        <CardDescription>
          Teste as actions melhoradas com índices e validação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testTransactionsPerformance}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Testando..." : "Testar Transações"}
          </Button>
          
          <Button 
            onClick={testCategoryPerformance}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Testando..." : "Testar Categorias"}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Resultado: {results.type === "transactions" ? "Transações" : "Categorias"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={results.success ? "text-green-600" : "text-red-600"}>
                      {results.success ? "✅ Sucesso" : "❌ Erro"}
                    </span>
                  </div>
                  
                  {results.duration && (
                    <div className="flex justify-between">
                      <span>Tempo:</span>
                      <span className="font-mono">{results.duration}</span>
                    </div>
                  )}
                  
                  {results.pagination && (
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{results.pagination.total} registros</span>
                    </div>
                  )}
                  
                  {results.data && results.type === "categories" && (
                    <div className="flex justify-between">
                      <span>Categorias:</span>
                      <span>{results.data.length} encontradas</span>
                    </div>
                  )}
                  
                  {results.error && (
                    <div className="text-red-600 text-xs">
                      Erro: {results.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {results.data && results.type === "categories" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dados das Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.data.map((category: any, index: number) => (
                      <div key={index} className="flex justify-between text-xs p-2 bg-gray-50 rounded">
                        <span>{category.category.name}</span>
                        <span className="font-mono">
                          R$ {(category.total / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 