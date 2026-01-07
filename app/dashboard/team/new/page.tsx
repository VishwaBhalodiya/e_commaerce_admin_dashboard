"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  ArrowLeft, 
  UserPlus, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Mail,
  CheckCircle,
  Loader2
} from "lucide-react"

// Available categories
const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Clothing",
  "Food",
  "Home",
  "Sports",
]

export default function AddAdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedCategories: [] as string[],
    sendEmail: true,
  })

  // Check if super admin
  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "super-admin"

  if (!isSuperAdmin) {
    router.push("/dashboard")
    return null
  }

  // Generate random password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password }))
  }

  // Handle category toggle
  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedCategories: prev.assignedCategories.includes(category)
        ? prev.assignedCategories.filter((c) => c !== category)
        : [...prev.assignedCategories, category],
    }))
  }

  // Select all categories
  const selectAllCategories = () => {
    setFormData((prev) => ({
      ...prev,
      assignedCategories: CATEGORIES,
    }))
  }

  // Clear all categories
  const clearAllCategories = () => {
    setFormData((prev) => ({
      ...prev,
      assignedCategories: [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate at least one category
    if (formData.assignedCategories.length === 0) {
      setError("Please assign at least one category to this admin")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "admin", // Always admin, never super-admin
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin")
      }

      // Show success message
      const categoriesText = formData.assignedCategories.join(", ")
      if (data.emailSent) {
        setSuccess(`✅ Admin created successfully!\n\nAssigned Categories: ${categoriesText}\n\nWelcome email sent to: ${formData.email}`)
      } else {
        setSuccess(`✅ Admin created successfully!\n\nAssigned Categories: ${categoriesText}\n\nCredentials:\nEmail: ${formData.email}\nPassword: ${formData.password}`)
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        assignedCategories: [],
        sendEmail: true,
      })

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push("/dashboard/team")
      }, 5000)

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/team">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Admin</h1>
          <p className="text-gray-600 mt-1">Create a new admin and assign categories</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm whitespace-pre-line mt-1">{success}</p>
              <p className="text-sm mt-3 text-green-600">Redirecting to team page in 5 seconds...</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Admin Details
              </CardTitle>
              <CardDescription>
                Enter the new admin's information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john@company.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Enter password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Category Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assign Categories *</span>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllCategories}
                  >
                    Select All
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllCategories}
                  >
                    Clear All
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Select which product categories this admin can manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((category) => {
                  const isSelected = formData.assignedCategories.includes(category)
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{category}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {formData.assignedCategories.length > 0 && (
                <p className="mt-4 text-sm text-blue-600">
                  ✓ {formData.assignedCategories.length} category(ies) selected: {formData.assignedCategories.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Email Option Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sendEmail: e.target.checked }))
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    <strong>Send welcome email</strong> with login credentials
                  </span>
                </label>
              </div>

              {!formData.sendEmail && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-sm">
                  ⚠️ Email won't be sent. Share credentials manually.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Link href="/dashboard/team" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading || formData.assignedCategories.length === 0} 
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}