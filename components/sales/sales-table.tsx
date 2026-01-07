"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Package } from "lucide-react"

interface Sale {
  id: string
  productId: string
  quantity: number
  revenue: number
  date: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }
}

interface SalesTableProps {
  sales: Sale[]
  onDelete: (id: string) => void
}

export function SalesTable({ sales, onDelete }: SalesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale? Stock will be restored.")) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(id)
      } else {
        alert("Failed to delete sale")
      }
    } catch (error) {
      alert("Failed to delete sale")
    } finally {
      setDeletingId(null)
    }
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No sales recorded</h3>
        <p className="text-gray-500 mt-1">
          Click "Record Sale" to add your first sale
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Unit Price</TableHead>
            <TableHead className="text-center">Revenue</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              {/* Product */}
              <TableCell>
                <div className="flex items-center gap-3">
                  {sale.product.images[0] ? (
                    <img
                      src={sale.product.images[0]}
                      alt={sale.product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="font-medium">{sale.product.name}</span>
                </div>
              </TableCell>

              {/* Category */}
              <TableCell>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {sale.product.category}
                </span>
              </TableCell>

              {/* Quantity */}
              <TableCell className="text-center font-medium">
                {sale.quantity}
              </TableCell>

              {/* Unit Price */}
              <TableCell className="text-center">
                ${sale.product.price.toFixed(2)}
              </TableCell>

              {/* Revenue */}
              <TableCell className="text-center">
                <span className="font-bold text-green-600">
                  ${sale.revenue.toFixed(2)}
                </span>
              </TableCell>

              {/* Date */}
              <TableCell>
                {new Date(sale.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(sale.id)}
                  disabled={deletingId === sale.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}