"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchDashboardStats } from "@/lib/api"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}