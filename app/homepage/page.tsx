'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ClientData = {
  clientName: string
  latestWR: string
}

export default function ClientHomepage() {
  const router = useRouter()
  const [clientData, setClientData] = useState<ClientData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/clients-latest-wr')
        if (!response.ok) {
          throw new Error('Failed to fetch client data')
        }
        const data = await response.json()
        const formattedData = data.map(([clientName, latestWR]: [string, string]) => ({
          clientName,
          latestWR
        }))
        setClientData(formattedData)
      } catch (err) {
        setError('An error occurred while fetching client data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientData()
  }, [])

  const handleLogout = () => {
    // Here you would typically clear any authentication tokens or user data
    // For this example, we'll just redirect to the login page
    router.push('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Client Homepage</h1>
      
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="/warehouse-receipt">
            <Button variant="outline">Warehouse Receipt</Button>
          </Link>
          <Link href="/purchase-order">
            <Button variant="outline">Purchase Order</Button>
          </Link>
          <Link href="/material-receipt">
            <Button variant="outline">Material Receipt</Button>
          </Link>
          <Link href="/edit-warehouse">
            <Button variant="outline">Edit Warehouse Receipt</Button>
          </Link>
          <Link href="/edit-purchase-order">
            <Button variant="outline">Edit Purchase Order</Button>
          </Link>
          <Link href="/edit-material">
            <Button variant="outline">Edit Material Receipt</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        {isLoading ? (
          <p className="text-center py-4">Loading client data...</p>
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Client Name</TableHead>
                <TableHead className="font-bold">Latest Warehouse Receipt</TableHead>
                <TableHead className="font-bold w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client, index) => (
                <TableRow key={index}>
                  <TableCell>{client.clientName}</TableCell>
                  <TableCell>{client.latestWR}</TableCell>
                  <TableCell>
                    <Link href={`/edit-warehouse/${client.latestWR}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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