"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, RotateCcw, AlertTriangle, Eye, X } from "lucide-react";

interface TrashItem {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  deletedAt: string;
  [key: string]: any;
}

interface TrashBinProps {
  title: string;
  description: string;
  items: TrashItem[];
  onRestore: (id: string) => Promise<{ success: boolean; error?: string }>;
  onHardDelete?: (id: string) => Promise<{ success: boolean; error?: string }>;
  renderItem: (item: TrashItem) => React.ReactNode;
  emptyMessage: string;
}

export default function TrashBin({
  title,
  description,
  items,
  onRestore,
  onHardDelete,
  renderItem,
  emptyMessage
}: TrashBinProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleRestore = async (id: string) => {
    setLoading(id);
    setMessage(null);
    
    try {
      const result = await onRestore(id);
      
      if (result.success) {
        setLocalItems(prev => prev.filter(item => item.id !== id));
        setMessage({ type: "success", text: "Item restaurado com sucesso!" });
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao restaurar item" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao restaurar item" });
    } finally {
      setLoading(null);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!onHardDelete) return;
    
    setLoading(id);
    setMessage(null);
    
    try {
      const result = await onHardDelete(id);
      
      if (result.success) {
        setLocalItems(prev => prev.filter(item => item.id !== id));
        setMessage({ type: "success", text: "Item deletado permanentemente!" });
      } else {
        setMessage({ type: "error", text: result.error || "Erro ao deletar item" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao deletar item" });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Lixeira ({localItems.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {message && (
            <div className={`p-3 rounded-md ${
              message.type === "success" 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message.text}
            </div>
          )}

          {localItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{emptyMessage}</p>
              <p className="text-sm">Nenhum item foi deletado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localItems.map((item) => (
                <Card key={item.id} className="border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {renderItem(item)}
                        <p className="text-xs text-gray-500 mt-2">
                          Deletado em: {formatDate(item.deletedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(item.id)}
                          disabled={loading === item.id}
                        >
                          {loading === item.id ? (
                            "Restaurando..."
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restaurar
                            </>
                          )}
                        </Button>
                        
                        {onHardDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleHardDelete(item.id)}
                            disabled={loading === item.id}
                          >
                            {loading === item.id ? (
                              "Deletando..."
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Deletar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Informações sobre a Lixeira
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Restaurar:</strong> Remove o item da lixeira e o torna ativo novamente</li>
            <li>• <strong>Deletar:</strong> Remove o item permanentemente (não pode ser desfeito)</li>
            <li>• <strong>Segurança:</strong> Itens na lixeira não aparecem nas listas normais</li>
            <li>• <strong>Limpeza:</strong> Itens podem ser removidos permanentemente quando necessário</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
} 