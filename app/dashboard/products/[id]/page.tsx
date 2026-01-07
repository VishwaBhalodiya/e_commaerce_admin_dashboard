"use client"

import { use, useState, useEffect } from "react"
import { MultiStepForm } from "@/components/products/multi-step-form"
import type { ProductFormData } from "@/lib/validations/product"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [initialData, setInitialData] = useState<ProductFormData | null>(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()

      if (data.product) {
        setInitialData({
          name: data.product.name,
          description: data.product.description,
          price: data.product.price.toString(),
          stock: data.product.stock.toString(),
          category: data.product.category,
          images: data.product.images.length > 0 ? data.product.images : [""],
        })
      }
    } catch (err) {
      setError("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Product not found</div>
      </div>
    )
  }

  return <MultiStepForm mode="edit" initialData={initialData} productId={id} />
}