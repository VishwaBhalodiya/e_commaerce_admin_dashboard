// ============================================
// API Functions for React Query
// ============================================

const API_BASE = "/api"

// --------------------------------------------
// PRODUCTS API
// --------------------------------------------

export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  sku: string
  stock: number
  categoryId: string
  category?: {
    id: string
    name: string
  }
  images: string[]
  status: string
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Fetch all products with filters
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  
  if (filters.page) params.set("page", filters.page.toString())
  if (filters.limit) params.set("limit", filters.limit.toString())
  if (filters.search) params.set("search", filters.search)
  if (filters.category) params.set("category", filters.category)
  if (filters.status) params.set("status", filters.status)
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)

  const response = await fetch(`${API_BASE}/products?${params.toString()}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch products")
  }
  
  return response.json()
}

// Fetch single product
export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch product")
  }
  
  return response.json()
}

// Create product
export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create product")
  }
  
  return response.json()
}

// Update product
export async function updateProduct({ id, data }: { id: string; data: Partial<Product> }): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update product")
  }
  
  return response.json()
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete product")
  }
}

// --------------------------------------------
// CATEGORIES API
// --------------------------------------------

export interface Category {
  id: string
  name: string
  description?: string
  _count?: {
    products: number
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch categories")
  }
  
  const data = await response.json()
  return data.categories || data
}

// --------------------------------------------
// DASHBOARD STATS API
// --------------------------------------------

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockProducts: number
  featuredProducts: number
  totalValue: number
  recentProducts: Product[]
  categoryStats: {
    name: string
    count: number
  }[]
  stockStats: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/dashboard/stats`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch dashboard stats")
  }
  
  return response.json()
}

// --------------------------------------------
// IMAGE UPLOAD API
// --------------------------------------------

export interface UploadResponse {
  url: string
  publicId: string
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to upload image")
  }

  return response.json()
}