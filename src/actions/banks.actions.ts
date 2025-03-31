"use server";

import { BankNamesProps } from "@/@types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CreateBankProps {
    bank: BankNamesProps
    description: string
    amount: number
}

export async function createBank({ bank, amount, description }: CreateBankProps) {
  try {
    const session = await auth();

    if (!session) throw new Error("Not authenticated");

    const userId = session.user?.id;

    if (!userId) throw new Error("User ID not found");

    await prisma.accountBanks.create({
      data: {
        userId,
        bank,
        description,
        amount
      },
    });

    return {
      success: true,
      message: "Bank created successfully",
    }
  } catch (error) {
    console.log(error);
  }
}
