"use client"

import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/actions/transactions.actions";
import { columns } from '@/components/columnsResumoTransactions'
import { Loading } from "./Loading";
import { TableTransactions } from "./TableTransactions";
import { useDateStore } from "@/store";



export const ResumeTransactions = () => {
  const date = useDateStore((state) => state.date);

  const { data, isPending } = useQuery({
    queryKey: ['transactions', date],
    queryFn: async () => await getTransactions({ date })
  })

  console.log({
    data
  })

  if(isPending) {
    return <Loading />
  }

 

  return <TableTransactions data={data?.transactions || []} columns={columns}  />
};
