"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Mail,
  Calendar,
  Tag
} from "lucide-react"

interface Admin {
  id: string
  name: string
  email: string
  role: string
  assignedCategories: string[]
  createdAt: string
}

export default function TeamPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Check if super admin
  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "super-admin"

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/dashboard")
      return
    }
    fetchAdmins()
  }, [isSuperAdmin, router])

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admins")
      const data = await response.json()
      setAdmins(data.admins || [])
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admins/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAdmins((prev) => prev.filter((admin) => admin.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete admin")
      }
    } catch (error) {
      alert("Failed to delete admin")
    } finally {
      setDeletingId(null)
    }
  }

  if (!isSuperAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading team...</div>
        </div>
      </div>
    )
  }

  const superAdmins = admins.filter(a => a.role === "super-admin")
  const regularAdmins = admins.filter(a => a.role === "admin")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage admin accounts and their category access</p>
        </div>
        <Link href="/dashboard/team/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Admin
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Team Members
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{admins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Super Admins
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{superAdmins.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Regular Admins
            </CardTitle>
            <Shield className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{regularAdmins.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Super Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            Super Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {superAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{admin.name}</p>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        Super Admin
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {admin.email}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      ✓ Full access to all categories
                    </p>
                  </div>
                </div>
                {/* No delete button for super admin */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regular Admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Admins ({regularAdmins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {regularAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No admins added yet</p>
              <Link href="/dashboard/team/new">
                <Button className="mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Admin
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {regularAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{admin.name}</p>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Admin
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {/* Assigned Categories */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <Tag className="w-3 h-3 text-gray-400" />
                        {admin.assignedCategories && admin.assignedCategories.length > 0 ? (
                          admin.assignedCategories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                            >
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No categories assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(admin.id, admin.name)}
                    disabled={deletingId === admin.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}