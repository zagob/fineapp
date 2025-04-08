import { ICONS_BANKS } from "./iconsBanks";
import IconItau from "../assets/icons/itau.svg";
import BancoDoBrasil from "../assets/icons/banco-do-brasil.svg";
import PicPay from "../assets/icons/picpay.png";
// import PicPay from "../assets/icons/picpay.svg";
import ITI from "../assets/icons/iti-itau.svg";
import Bradesco from "../assets/icons/bradesco.svg";

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
  ITAU: IconItau,
  BANCO_DO_BRASIL: BancoDoBrasil,
  PICPAY: PicPay,
  ITI: ITI,
  NUBANK: "",
  BRADESCO: Bradesco,
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
