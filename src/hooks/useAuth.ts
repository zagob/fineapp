"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/actions/user.actions";

export function useAuth() {
  const { data: session, status } = useSession();

  const { data: userId, isLoading: isLoadingUserId } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      if (!session?.user?.email) return null;
      return await getUserId();
    },
    enabled: !!session?.user?.email,
  });

  return {
    session,
    userId,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading" || isLoadingUserId,
    user: session?.user,
  };
} 