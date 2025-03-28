import { EyeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CardContentAccountBank } from "./CardContentAccountBank";
import { RegisterAccountBank } from "./RegisterAccountBank";

export async function ResumeAccountBanks() {
  return (
    <Card className="w-[300px] bg-transparent text-zinc-50 border-neutral-800">
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Banks</CardTitle>
          <CardDescription>Total: R$42.000,22</CardDescription>
        </div>
        <EyeIcon className="size-5 text-neutral-500" />
      </CardHeader>
      <CardContent className="p-0">
        <CardContentAccountBank
          title="Itaú"
          type_account="Conta Corrente"
          value="R$42.000,22"
        />

        <CardContentAccountBank
          title="PicPay"
          type_account="Conta Corrente"
          value="R$12.353,02"
        />

        <div className="p-4">
          <RegisterAccountBank />
        </div>
      </CardContent>
    </Card>
  );
}
