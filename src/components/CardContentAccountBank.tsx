"use client";

import { X } from "lucide-react";
import { UpdatedAccountBank } from "./UpdatedAccountBank";
import { useState } from "react";

interface CardContentAccountBankProps {
  title: BankNamesProps;
  type_account: string;
  value: string;
  bankId: string;
}

export const CardContentAccountBank = ({
  title,
  type_account,
  value,
  bankId,
}: CardContentAccountBankProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <UpdatedAccountBank
        open={open}
        onOpenChange={setOpen}
        bankId={bankId}
        description={type_account}
        amount={value}
        bank={title}
      />
      
      <div
        onClick={() => setOpen(true)}
        className="flex relative items-center justify-between border border-neutral-800 px-4 py-4 w-full"
      >
        <div className="flex items-center gap-2">
          <div className="bg-orange-400 rounded-full size-10" />
          <div className="flex flex-col">
            <h2 className="leading-tight">{title}</h2>
            <span className="text-xs">{type_account}</span>
          </div>
        </div>
        <span>{value}</span>
        <X className="size-4 absolute top-2 right-1 text-zinc-600" />
      </div>
    </>
  );
};
