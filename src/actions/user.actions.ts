"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserId() {
  const session = await auth();

  try {
    if (!session) throw new Error("Not authenticated");

    let userId = session.user?.id;

    if (!userId) {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user?.email as string,
        },
      });

      userId = user?.id;
    }

    return userId;
  } catch (error) {
    console.log(error);
  }
}
