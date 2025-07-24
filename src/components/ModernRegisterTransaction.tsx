import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarInput } from "./CalendarInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/actions/categories.actions";
import { getBanks } from "@/actions/banks.actions";
import { createTransaction } from "@/actions/transactions.actions";
import { Loading } from "./Loading";
import { Plus, Banknote, Tag, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  date: z.date(),
  bank: z.string(),
  category: z.string(),
  description: z.string().optional(),
  value: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type FormSchemaProps = z.infer<typeof formSchema>;

export function ModernRegisterTransaction() {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<FormSchemaProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      bank: "",
      category: "",
      description: "",
      value: "",
      type: "EXPENSE",
    },
  });

  const { data: banks } = useQuery({
    queryKey: ["banks"],
    queryFn: async () => await getBanks(),
    staleTime: 1000,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", form.watch("type")],
    queryFn: async () => await getCategories({ type: form.watch("type") }),
  });

  const { mutate: handleSubmitForm, isPending } = useMutation({
    mutationFn: async (values: FormSchemaProps) => {
      await createTransaction(values);
    },
    onSuccess: () => {
      form.reset();
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 1200);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-xl hover:scale-105 transition-transform rounded-full p-0 w-16 h-16 flex items-center justify-center text-3xl"
          size="icon"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full bg-white/10 backdrop-blur-2xl border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-emerald-600/80 to-blue-600/80 p-6">
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Banknote className="w-7 h-7 text-white" /> Nova Transação
          </DialogTitle>
        </DialogHeader>
        <form
          className="p-6 flex flex-col gap-5"
          onSubmit={form.handleSubmit((values) => handleSubmitForm(values))}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" /> Data
              </label>
              <CalendarInput name="date" control={form.control} />
            </div>
            <div>
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4" /> Tipo
              </label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as "INCOME" | "EXPENSE")}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4" /> Categoria
              </label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full mr-2" style={{ background: cat.color }} />
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4" /> Banco
              </label>
              <Select
                value={form.watch("bank")}
                onValueChange={(v) => form.setValue("bank", v)}
              >
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {banks?.banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>{bank.bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" /> Descrição
              </label>
              <Textarea
                className="bg-neutral-800 border-neutral-700 text-white resize-none"
                placeholder="Descrição (opcional)"
                {...form.register("description")}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-neutral-300 flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4" /> Valor
              </label>
              <Input
                className="bg-neutral-800 border-neutral-700 text-white text-lg"
                placeholder="R$ 0,00"
                {...form.register("value")}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  const rawValue = input.value.replace(/\D/g, "");
                  if (!rawValue) return;
                  const formattedValue = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(parseFloat(rawValue) / 100);
                  input.value = formattedValue;
                }}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-lg font-bold py-3 rounded-xl mt-2 hover:scale-[1.02] transition-transform"
            disabled={isPending}
          >
            {isPending ? <Loading /> : <span>Registrar Transação</span>}
          </Button>
          {success && (
            <div className="flex items-center justify-center gap-2 text-green-400 font-bold mt-2 animate-pulse">
              <CheckCircle2 className="w-5 h-5" /> Transação registrada!
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
} 