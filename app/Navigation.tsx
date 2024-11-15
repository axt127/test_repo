'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Home, FileText, ShoppingCart, Package } from 'lucide-react'
import { useClient } from './ClientContext'

export function Navigation() {
  const { clientName } = useClient()

  return (
    <nav className="bg-primary text-primary-foreground shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Image src="/wex.png" alt="Wex Logo" width={50} height={50} className="rounded-full" />
            <span className="text-xl font-bold">WMS Express</span>
          </div>
          <div className="flex justify-center space-x-1">
            {[
              { href: "/client/HomePage", label: "Home", icon: Home },
              { href: "/client/HomePage/WR", label: "Warehouse Receipt", icon: FileText },
              { href: "/client/HomePage/PO", label: "Purchase Order", icon: ShoppingCart },
              { href: "/client/HomePage/MR", label: "Material Receipt", icon: Package },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
          <div className="text-sm">Client: {clientName}</div>
        </div>
      </div>
    </nav>
  )
}