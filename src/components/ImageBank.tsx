import { bankIcons } from "@/variants/accountBanks";
import Image from "next/image";

interface ImageBankProps {
  bank: BankNamesProps;
  width: number;
  height: number;
}

export const ImageBank = ({ bank, height, width }: ImageBankProps) => {
  return (
    <Image
      src={bankIcons[bank as keyof typeof bankIcons]}
      alt={bank}
      width={width}
      height={height}
      className="rounded border-neutral-600"
    />
  );
};
