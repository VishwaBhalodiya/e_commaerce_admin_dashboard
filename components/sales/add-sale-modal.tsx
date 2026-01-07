"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, AlertCircle, DollarSign } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  images: string[]
}

interface AddSaleModalProps {
  onSaleAdded: () => void
}

export function AddSaleModal({ onSaleAdded }: AddSaleModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "1",
  })

  // Fetch products when modal opens
  useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error("Failed to fetch products:", err)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Get selected product details
  const selectedProduct = products.find((p) => p.id === formData.productId)
  const calculatedRevenue = selectedProduct
    ? selectedProduct.price * parseInt(formData.quantity || "0")
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: parseInt(formData.quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create sale")
      }

      // Reset form and close modal
      setFormData({ productId: "", quantity: "1" })
      setOpen(false)
      onSaleAdded()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Record Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Record New Sale
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Selection */}
          <div>
            <Label htmlFor="product">Select Product *</Label>
            {loadingProducts ? (
              <div className="text-gray-500 py-2">Loading products...</div>
            ) : (
              <select
                id="product"
                value={formData.productId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, productId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={product.stock === 0}
                  >
                    {product.name} - ${product.price.toFixed(2)} ({product.stock}{" "}
                    in stock)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                {selectedProduct.images[0] && (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-600">
                    ${selectedProduct.price.toFixed(2)} per unit •{" "}
                    {selectedProduct.stock} available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.stock || 999}
              value={formData.quantity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quantity: e.target.value }))
              }
              required
            />
            {selectedProduct && parseInt(formData.quantity) > selectedProduct.stock && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Not enough stock available
              </p>
            )}
          </div>

          {/* Calculated Revenue */}
          {selectedProduct && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Calculated Revenue:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${calculatedRevenue.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.quantity} × ${selectedProduct.price.toFixed(2)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.productId ||
                !formData.quantity ||
                (selectedProduct && parseInt(formData.quantity) > selectedProduct.stock)
              }
              className="flex-1"
            >
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}