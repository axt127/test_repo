'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Home, FileText, ShoppingCart, Package, Edit, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

type Client = string

export default function EmployeeHomepage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/all-clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleLogout = () => {
    router.push('/login')
  }

  function Navigation() {
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
                { href: "/Emp/Homepage", label: "Home", icon: Home },
                { href: "/Emp/Homepage/NEW_Form/warehouse-receipt", label: "Warehouse Receipt", icon: FileText },
                { href: "/Emp/Homepage/NEW_Form/purchase-order", label: "Purchase Order", icon: ShoppingCart },
                { href: "/Emp/Homepage/NEW_Form/material-receipt", label: "Material Receipt", icon: Package },
                { href: "/Emp/Homepage/EDIT_FORM/edit-warehouse", label: "Edit Warehouse", icon: Edit },
                { href: "/Emp/Homepage/EDIT_FORM/edit-purchase-order", label: "Edit PO", icon: Edit },
                { href: "/Emp/Homepage/EDIT_FORM/view_po", label: "View PO", icon: Edit },

              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className="flex flex-col items-center justify-center h-16 w-20">
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs text-center">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
            <Button 
              onClick={handleLogout}
              className="flex items-center"
              variant="secondary"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 relative"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-primary">Employee Dashboard</h1>
        
        <Card className="w-full mb-8">
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Client Name</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell>{client}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/Emp/Homepage/Data?clientName=${encodeURIComponent(client)}`)}
                        aria-label={`View details for ${client}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}