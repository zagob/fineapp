"use client";

import { X } from "lucide-react";
import { UpdatedAccountBank } from "./UpdatedAccountBank";
import { useState } from "react";
import Image from "next/image";
import { bankIcons } from "@/variants/accountBanks";

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
        className="flex relative items-center justify-between border-b border-neutral-800 px-4 py-4 w-full"
      >
        <div className="flex items-center gap-2">
          {/* <div className="bg-orange-400 rounded-full size-10" /> */}
          <Image
            src={bankIcons[title]}
            width={40}
            height={40}
            alt="bank"
            className="rounded-sm size-10"
          />
          <div className="flex flex-col">
            <h2 className="leading-tight">{title}</h2>
            <span className="text-xs text-neutral-500">{type_account}</span>
          </div>
        </div>
        <span>{value}</span>
        <X className="size-4 absolute top-2 right-1 text-zinc-600" />
      </div>
    </>
  );
};
