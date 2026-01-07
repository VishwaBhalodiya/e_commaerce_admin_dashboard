"use client"

import { useMutation } from "@tanstack/react-query"
import { uploadImage } from "@/lib/api"

export function useImageUpload() {
  return useMutation({
    mutationFn: uploadImage,
  })
}