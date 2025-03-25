interface CardContentAccountBankProps {
  title: string;
  type_account: string;
  value: string;
}

export const CardContentAccountBank = ({
  title,
  type_account,
  value,
}: CardContentAccountBankProps) => {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-4 pb-4 w-full">
      <div className="flex items-center gap-2">
        <div className="bg-orange-400 rounded-full size-10" />
        <div className="flex flex-col">
          <h2 className="leading-tight">{title}</h2>
          <span className="text-xs">{type_account}</span>
        </div>
      </div>
      <span>{value}</span>
    </div>
  );
};
