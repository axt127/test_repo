'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ClientContextType {
  clientName: string
  setClientName: (name: string) => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clientName, setClientName] = useState('')

  return (
    <ClientContext.Provider value={{ clientName, setClientName }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return context
}