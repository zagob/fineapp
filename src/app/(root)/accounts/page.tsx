import { ModernAccountBanks } from "@/components/ModernAccountBanks";

export default function Accounts() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            💳 Contas Bancárias
          </h1>
          <p className="text-gray-600">
            Gerencie suas contas bancárias e acompanhe seus saldos
          </p>
        </div>

        <ModernAccountBanks />
      </div>
    </div>
  );
}
