import { CardValue } from "@/components/CardValue";
import { CircleDollarSign } from "lucide-react";

export default function Accounts() {
  return (
    <div className="">
      {/* <CardValue
        title="Total value"
        value="R$94.023,00"
        icon={CircleDollarSign}
      /> */}
      <div className="flex flex-wrap gap-4">
        <div className="w-[300px]  rounded border-neutral-800 shadow-xs shadow-neutral-800 p-4 border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-400 rounded-full size-10" />
            <div className="flex flex-col">
              <h2>Itaú</h2>
              <span className="text-xs text-neutral-500">Conta Corrente</span>
            </div>
          </div>
          <span>R$42.452,00</span>
        </div>
        <div className="w-[300px]  rounded border-neutral-800 shadow-xs shadow-neutral-800 p-4 border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-400 rounded-full size-10" />
            <div className="flex flex-col">
              <h2>PicPay</h2>
              <span className="text-xs text-neutral-500">Conta Corrente</span>
            </div>
          </div>
          <span>R$14.123,00</span>
        </div>
      </div>
    </div>
  );
}
