"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  ShoppingCart,
  Menu,
  Users,
  X
} from "lucide-react"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Safely check for super-admin role
  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "super-admin"

  const navItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard"
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Package,
      active: pathname.startsWith("/dashboard/products")
    },
    {
      href: "/dashboard/sales",
      label: "Sales",
      icon: ShoppingCart,
      active: pathname.startsWith("/dashboard/sales")
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/analytics")
    },
    {
        href: "/dashboard/team",
        label: "Team",
        icon: Users,
        active: pathname.startsWith("/dashboard/team")
    }
  ]

  // Add Settings for Super Admin only
  if (isSuperAdmin) {
    navItems.push({
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings")
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo & Nav */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center ml-2 sm:ml-0">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <span className="text-2xl">🛍️</span>
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">
                    Admin Dashboard
                  </span>
                </Link>
              </div>
              
              {/* Desktop Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        item.active
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${item.active ? "text-blue-600" : ""}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side - User Info & Logout */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">
                  {session?.user?.name || "Admin"}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-end gap-2">
                  <span className="truncate max-w-[150px]">
                    {session?.user?.email}
                  </span>
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Super Admin
                    </span>
                  )}
                  {!isSuperAdmin && userRole === "admin" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      item.active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${item.active ? "text-blue-600" : ""}`} />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Mobile User Info */}
              <div className="border-t border-gray-200 mt-2 pt-3 px-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                  {isSuperAdmin && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} E-Commerce Admin Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}