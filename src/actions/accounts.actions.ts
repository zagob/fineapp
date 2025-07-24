"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getAccounts({ date }: { date: Date }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const accounts = await prisma.accountBanks.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        id: "desc",
      },
    });

    return { accounts };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return { accounts: [] };
  }
}

export async function createAccount(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const bank = formData.get("bank") as string;
    const description = formData.get("description") as string;
    const amount = parseInt(formData.get("amount") as string) || 0;

    if (!bank || !description) {
      throw new Error("Bank and description are required");
    }

    const account = await prisma.accountBanks.create({
      data: {
        bank: bank as any,
        description,
        amount,
        userId: session.user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/accounts");
    return { success: true, account };
  } catch (error) {
    console.error("Error creating account:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function updateAccount(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const id = formData.get("id") as string;
    const bank = formData.get("bank") as string;
    const description = formData.get("description") as string;
    const amount = parseInt(formData.get("amount") as string) || 0;

    if (!id || !bank || !description) {
      throw new Error("ID, bank and description are required");
    }

    const account = await prisma.accountBanks.update({
      where: {
        id,
      },
      data: {
        bank: bank as any,
        description,
        amount,
      },
    });

    revalidatePath("/");
    revalidatePath("/accounts");
    return { success: true, account };
  } catch (error) {
    console.error("Error updating account:", error);
    return { success: false, error: "Failed to update account" };
  }
}

export async function deleteAccount(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const id = formData.get("id") as string;

    if (!id) {
      throw new Error("Account ID is required");
    }

    await prisma.accountBanks.delete({
      where: {
        id,
      },
    });

    revalidatePath("/");
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
} 