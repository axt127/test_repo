// Indicate that this is a client-side component
'use client'

// Import necessary React hooks and types
import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the shape of our context
interface ClientContextType {
  clientName: string
  setClientName: (name: string) => void
}

// Create a context for the client information
const ClientContext = createContext<ClientContextType | undefined>(undefined)

// Create a provider component to wrap around components that need access to the context
export function ClientProvider({ children }: { children: ReactNode }) {
  // Set up state for the client name
  const [clientName, setClientName] = useState('')

  // Provide the context value to child components
  return (
    <ClientContext.Provider value={{ clientName, setClientName }}>
      {children}
    </ClientContext.Provider>
  )
}

// Custom hook to use the client context
export function useClient() {
  // Attempt to access the context
  const context = useContext(ClientContext)
  // If the context is undefined, it means we're trying to use it outside of a provider
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  // Return the context if it exists
  return context
}