'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WarehouseSearch() {
  const [warehouseNumbers, setWarehouseNumbers] = useState<string[]>([])
  const [searchData, setSearchData] = useState({
    warehouseNumber: '',
    poNumber: ''
  })
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWarehouseNumbers = async () => {
      try {
        const response = await fetch('https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/warehouse-receipts')
        if (!response.ok) {
          throw new Error('Failed to fetch warehouse numbers')
        }
        const data = await response.json()
        setWarehouseNumbers(data)
      } catch (error) {
        console.error('Error fetching warehouse numbers:', error)
        setError('Failed to load warehouse numbers. Please try again later.')
      }
    }

    fetchWarehouseNumbers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchData(prev => ({ ...prev, [name]: value }))
  }

  const handleWarehouseSelect = (value: string) => {
    setSearchData(prev => ({ ...prev, warehouseNumber: value }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchData.warehouseNumber || !searchData.poNumber) {
      setError('Both Warehouse Number and PO Number are required.')
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search-warehouse?warehouseNumber=${encodeURIComponent(searchData.warehouseNumber)}&poNumber=${encodeURIComponent(searchData.poNumber)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch warehouse forms')
      }
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching warehouse forms:', error)
      setError('An error occurred while searching. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Warehouse Receipts</h1>
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="warehouseNumber" className="block text-sm font-medium text-gray-700">Warehouse Number</label>
          <Select onValueChange={handleWarehouseSelect} value={searchData.warehouseNumber}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a warehouse number" />
            </SelectTrigger>
            <SelectContent>
              {warehouseNumbers.map((number) => (
                <SelectItem key={number} value={number}>
                  {number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <h2 className="text-xl font-semibold mb-2">Warehouse Receipt {result.warehouseNumber}</h2>
            <p className="text-sm text-gray-600">PO Number: {result.poNumber}</p>
            {result.mrNumber && <p className="text-sm text-gray-600">MR Number: {result.mrNumber}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}