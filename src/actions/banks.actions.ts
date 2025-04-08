"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";

export async function getBanks() {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const banks = await prisma.accountBanks.findMany({
      where: {
        userId,
      },
    });

    const totalAmountBanks = banks.reduce((acc, bank) => {
      return acc + bank.amount;
    }, 0);

    return {
      success: true,
      totalAmount: totalAmountBanks,
      banks,
    };
  } catch (error) {
    console.log(error);
  }
}

interface CreateBankProps {
  bank: BankNamesProps;
  description: string;
  amount: number;
}

export async function createBank({
  bank,
  amount,
  description,
}: CreateBankProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    await prisma.accountBanks.create({
      data: {
        userId,
        bank,
        description,
        amount,
      },
    });

    return {
      success: true,
      message: "Bank created successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

interface UpdateBankProps {
  bankId: string;
  bank: BankNamesProps;
  description: string;
  amount: number;
}

export async function updateBank({
  bankId,
  bank,
  amount,
  description,
}: UpdateBankProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    await prisma.accountBanks.update({
      where: {
        userId,
        id: bankId,
      },
      data: {
        bank,
        description,
        amount,
      },
    });

    return {
      success: true,
      message: "Bank Updated successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteBank(id: string) {
  try {
    await prisma.accountBanks.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Bank deleted successfully",
    };
  } catch (error) {
    console.log(error);
  }
}
