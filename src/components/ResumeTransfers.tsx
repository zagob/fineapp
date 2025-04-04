"use client"

import { useQuery } from "@tanstack/react-query";
import { Loading } from "./Loading";
import { useDateStore } from "@/store";
import { columnsTransfer } from "./ColumnsTransfers";
import { TableTransfers } from "./TableTransfers";
import { getTransfers } from "@/actions/transfers.actions";



export const ResumeTransfers = () => {
  const date = useDateStore((state) => state.date);

  const { data, isPending } = useQuery({
    queryKey: ['transfers', date],
    queryFn: async () => await getTransfers(date)
  })

  console.log({
    data
  })

  if(isPending) {
    return <Loading />
  }

  return <TableTransfers data={data?.transfers || []} columns={columnsTransfer}  />
};
