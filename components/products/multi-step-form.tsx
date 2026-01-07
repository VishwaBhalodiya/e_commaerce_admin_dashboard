"use client"
import { ImageUpload } from "./image-upload"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepIndicator } from "./step-indicator"
import {
  basicInfoSchema,
  pricingSchema,
  mediaSchema,
  CATEGORIES,
  type ProductFormData,
} from "@/lib/validations/product"
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Package,
  DollarSign,
  Image,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

const STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Pricing" },
  { id: 3, name: "Media" },
  { id: 4, name: "Review" },
]

interface MultiStepFormProps {
  initialData?: ProductFormData
  productId?: string
  mode: "create" | "edit"
}

export function MultiStepForm({ initialData, productId, mode }: MultiStepFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price || "",
    stock: initialData?.stock || "",
    description: initialData?.description || "",
    images: initialData?.images || [""],
  })

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle image URL changes
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({ ...prev, images: newImages }))
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }))
    }
  }

  // Add new image field
  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  // Remove image field
  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, images: newImages }))
    }
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    setErrors({})
    let result

    switch (step) {
      case 1:
        result = basicInfoSchema.safeParse({
          name: formData.name,
          category: formData.category,
        })
        break
      case 2:
        result = pricingSchema.safeParse({
          price: formData.price,
          stock: formData.stock,
        })
        break
      case 3:
        result = mediaSchema.safeParse({
          description: formData.description,
          images: formData.images,
        })
        break
      default:
        return true
    }

    // AFTER:
if (!result.success) {
  const newErrors: Record<string, string> = {}
  
  // Use 'issues' instead of 'errors' for ZodError
  result.error.issues.forEach((issue) => {
    if (issue.path && issue.path[0]) {
      newErrors[issue.path[0] as string] = issue.message
    }
  })
  
  setErrors(newErrors)
  return false
}

    return true
  }

  // Go to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  // Go to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Go to specific step (for review page edit buttons)
  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  // Submit form
  const handleSubmit = async () => {
    setLoading(true)
    setErrors({})

    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${productId}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          description: formData.description,
          images: formData.images.filter((img) => img.trim() !== ""),
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${mode} product`)
      }

      router.push("/dashboard/products")
      router.refresh()
    } catch (err: any) {
      setErrors({ submit: err.message || "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-gray-600 mt-1">
            Step {currentStep} of 4:{" "}
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Pricing & Inventory"}
            {currentStep === 3 && "Media & Description"}
            {currentStep === 4 && "Review & Submit"}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Wireless Mouse"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing & Inventory */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Pricing & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="29.99"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="100"
                  className={errors.stock ? "border-red-500" : ""}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.stock}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Media & Description */}
      {currentStep === 3 && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Image className="w-5 h-5 text-purple-500" />
        Media & Description
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="description">Description *</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your product in detail..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Image Upload Component */}
      <div>
        <Label>Product Images *</Label>
        <div className="mt-2">
          <ImageUpload
            images={formData.images.filter(img => img.trim() !== "")}
            onChange={(newImages) => {
              setFormData(prev => ({ ...prev, images: newImages }))
              if (errors.images) {
                setErrors(prev => ({ ...prev, images: "" }))
              }
            }}
            maxImages={5}
          />
        </div>
        {errors.images && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.images}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </CardContent>
  </Card>
)}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Review & Submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info Review */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Basic Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(1)}
                  className="text-blue-500"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{formData.category}</p>
                </div>
              </div>
            </div>

            {/* Pricing Review */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing & Inventory
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(2)}
                  className="text-blue-500"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Price:</span>
                  <p className="font-medium text-green-600">${formData.price}</p>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <p className="font-medium">{formData.stock} units</p>
                </div>
              </div>
            </div>

            {/* Media Review */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Media & Description
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToStep(3)}
                  className="text-blue-500"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="text-gray-500">Description:</span>
                  <p className="font-medium">{formData.description}</p>
                </div>
                <div>
                  <span className="text-gray-500">Images:</span>
                  <p className="font-medium">
                    {formData.images.filter((img) => img.trim() !== "").length} image(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  "Saving..."
                ) : mode === "create" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}