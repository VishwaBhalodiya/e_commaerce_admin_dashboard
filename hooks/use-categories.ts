"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchCategories } from "@/lib/api"

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // Categories don't change often
  })
}