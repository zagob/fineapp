"use client";

import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/actions/transactions.actions";
import { columns } from "@/components/ColumnsResumoTransactions";
import { Loading } from "./Loading";
import { useDateStore } from "@/store";
import { TableComponent } from "./Table";

export const ResumeTransactions = () => {
  const date = useDateStore((state) => state.date);

  const { data, isPending } = useQuery({
    queryKey: ["transactions", date],
    queryFn: async () => await getTransactions({ date }),
  });

  if (isPending) {
    return <Loading />;
  }

  return <TableComponent data={data?.transactions?.slice(0, 5) || []} columns={columns} />;
};
