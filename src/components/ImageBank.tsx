import { bankIcons } from "@/variants/accountBanks";
import Image from "next/image";
import { useState } from "react";

interface ImageBankProps {
  bank: BankNamesProps;
  width: number;
  height: number;
}

export const ImageBank = ({ bank, height, width }: ImageBankProps) => {
  const [imageError, setImageError] = useState(false);
  const imageSrc = bankIcons[bank as keyof typeof bankIcons];

  if (!imageSrc || imageError) {
    return (
      <div 
        className="rounded border-neutral-600 bg-neutral-700 flex items-center justify-center text-xs text-neutral-400"
        style={{ width, height }}
      >
        {bank}
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={bank}
      width={width}
      height={height}
      className="rounded border-neutral-600"
      onError={() => setImageError(true)}
    />
  );
};
