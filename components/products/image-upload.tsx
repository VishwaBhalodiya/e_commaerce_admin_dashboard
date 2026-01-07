"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  Plus 
} from "lucide-react"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max images
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Add new image URL to list
      onChange([...images, data.url])
    } catch (err: any) {
      setError(err.message || "Failed to upload image")
    } finally {
      setUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? "border-blue-300 bg-blue-50"
              : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
              <p className="text-blue-600 font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-700 font-medium">Click to upload image</p>
              <p className="text-gray-500 text-sm mt-1">
                PNG, JPG, WEBP up to 5MB
              </p>
              <p className="text-gray-400 text-xs mt-2">
                {images.length} of {maxImages} images uploaded
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Alternative: URL Input */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Or add image URL manually:</p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border rounded-md text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const input = e.target as HTMLInputElement
                const url = input.value.trim()
                if (url && images.length < maxImages) {
                  onChange([...images, url])
                  input.value = ""
                }
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              const input = (e.target as HTMLElement)
                .parentElement?.querySelector("input") as HTMLInputElement
              const url = input?.value.trim()
              if (url && images.length < maxImages) {
                onChange([...images, url])
                input.value = ""
              }
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}