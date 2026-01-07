import { z } from "zod"

// Step 1: Basic Information Schema
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name must be less than 100 characters"),
  category: z
    .string()
    .min(1, "Please select a category"),
})

// Step 2: Pricing & Inventory Schema
export const pricingSchema = z.object({
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number",
    }),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: "Stock must be 0 or more",
    }),
})

// Step 3: Media & Description Schema
export const mediaSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  images: z
    .array(z.string())
    .refine((images) => images.some((img) => img.trim() !== ""), {
      message: "At least one image URL is required",
    }),
})

// Categories list
export const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Clothing",
  "Food",
  "Home",
  "Sports",
] as const

// Type for form data
export type ProductFormData = {
  name: string
  category: string
  price: string
  stock: string
  description: string
  images: string[]
}