'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ReceiptData = {
  warehouseNumber: string
  poNumber: string
  mrNumber: string
}

export default function EmployeeHomepage() {
  const router = useRouter()
  const [receipts, setReceipts] = useState<ReceiptData[]>([
    { warehouseNumber: "1", poNumber: "2", mrNumber: "3" },
    { warehouseNumber: "4", poNumber: "5", mrNumber: "6" },
    { warehouseNumber: "7", poNumber: "8", mrNumber: "9" },
  ])

  const handleLogout = () => {
    // Here you would typically clear any authentication tokens or user data
    // For this example, we'll just redirect to the login page
    router.push('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Homepage</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Warehouse Number</TableHead>
              <TableHead className="font-bold">PO Number</TableHead>
              <TableHead className="font-bold">MR Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt, index) => (
              <TableRow key={index}>
                <TableCell>{receipt.warehouseNumber}</TableCell>
                <TableCell>{receipt.poNumber}</TableCell>
                <TableCell>{receipt.mrNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button 
          onClick={handleLogout}
          className="flex items-center"
          variant="outline"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}