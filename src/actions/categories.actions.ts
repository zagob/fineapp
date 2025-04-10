"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "./user.actions";

export async function getEveryCategories() {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const categories = await prisma.categories.findMany({
      where: {
        userId,
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
  }
}

interface GetCategoriesProps {
  type: "EXPENSE" | "INCOME";
}

export async function getCategories({ type }: GetCategoriesProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    const categories = await prisma.categories.findMany({
      where: {
        userId,
        type,
      },
    });

    return categories;
  } catch (error) {
    console.log(error);
  }
}

interface CreateCategoryProps {
  name: string;
  typeaccount: "EXPENSE" | "INCOME";
  color: string;
  icon: string;
}

export async function createCategory({
  name,
  typeaccount,
  color,
  icon,
}: CreateCategoryProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    await prisma.categories.create({
      data: {
        name,
        type: typeaccount,
        color,
        icon,
        userId,
      },
    });

    return {
      success: true,
      message: "Category created successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

interface UpdateCategoryProps {
  name: string;
  typeaccount: "EXPENSE" | "INCOME";
  color: string;
  icon: string;
}

export async function updateCategory(id: string, data: UpdateCategoryProps) {
  try {
    const userId = await getUserId();

    if (!userId) throw new Error("User ID not found");

    await prisma.categories.update({
      where: {
        userId,
        id,
      },
      data,
    });
    return {
      success: true,
      message: "Category updated successfully",
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.categories.delete({
      where: {
        id,
      },
    });
    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.log(error);
  }
}
