import { ICONS_BANKS } from "./iconsBanks";

export const ACCOUNT_BANKS = Object.freeze({
  BANCO_DO_BRASIL: {
    name: "Banco do Brasil",
    icon: () => {},
    color: "",
  },
  ITAU: {
    name: "Itaú",
    icon: ICONS_BANKS.ITAU,
    color: "",
  },
  ITI: {
    name: "ITI",
    icon: () => {},
    color: "",
  },
  PICPAY: {
    name: "PicPay",
    icon: () => {},
    color: "",
  },
  INTER: {
    name: "Inter",
    icon: () => {},
    color: "",
  },
});

export const bankIcons: Record<string, string> = {
  ITAU: "/icons/itau.svg",
  BANCO_DO_BRASIL: "/icons/banco-do-brasil.svg",
  PICPAY: "/icons/picpay.png",
  ITI: "/icons/iti-itau.svg",
  NUBANK: "",
  BRADESCO: "/icons/bradesco.svg",
  SANTANDER: "",
  CAIXA: "",
  INTER: "",
  C6: "",
};

export const BANKS = [
  "BANCO_DO_BRASIL",
  "ITAU",
  "ITI",
  "PICPAY",
  "NUBANK",
  "BRADESCO",
  "SANTANDER",
  "CAIXA",
  "INTER",
  "C6",
] as const;
