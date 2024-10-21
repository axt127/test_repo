'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function ClientSearch() {
  const [searchData, setSearchData] = useState({
    clientName: '',
    poNumber: ''
  })
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchData(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchData.clientName || !searchData.poNumber) {
      setError('Both Client Name and PO Number are required.')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search-client?clientName=${encodeURIComponent(searchData.clientName)}&poNumber=${encodeURIComponent(searchData.poNumber)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch client purchase orders')
      }
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching client purchase orders:', error)
      setError('An error occurred while searching. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Client Purchase Orders</h1>
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={searchData.clientName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div>
          <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">PO Number</label>
          <input
            type="text"
            id="poNumber"
            name="poNumber"
            value={searchData.poNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Link href="/homepage">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </form>
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="mt-8 space-y-4">
        {searchResults.map((result: any, index: number) => (
          <div key={index} className="border rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2">Client: {result.clientName}</h2>
            <p className="text-sm text-gray-600">PO Number: {result.poNumber}</p>
            {result.orderDate && <p className="text-sm text-gray-600">Order Date: {result.orderDate}</p>}
            {result.totalAmount && <p className="text-sm text-gray-600">Total Amount: ${result.totalAmount.toFixed(2)}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}