'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [imageError, setImageError] = useState(false)

  const router = useRouter()

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'emp@gmail.com' && password === '1') {
      console.log('Login successful, attempting to navigate...')
      try {
        await router.push('/employee')
        console.log('Navigation completed')
      } catch (error) {
        console.error('Navigation failed:', error)
        console.log('Attempting fallback navigation...')
        window.location.href = '/employee'
      }
    } else if (email === 'cli@gmail.com' && password === '1') {
      console.log('Login successful, attempting to navigate...')
      try {
        await router.push('/homepage')
        console.log('Navigation completed')
      } catch (error) {
        console.error('Navigation failed:', error)
        console.log('Attempting fallback navigation...')
        window.location.href = '/homepage'
      }
    } else {
      setErrorMessage('Invalid email or password for Client Login')
    }
  }

  const handleEmployeeLogin = () => {
    alert('Employee Login triggered!')
    // Optionally redirect employees to another page if needed
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
      <div className="relative w-[150px] h-[150px] mb-8">
        {!imageError ? (
          <Image
            src="/wex.png"
            alt="Wex Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            Logo not found
          </div>
        )}
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center"> Sign in</h2>
        <form onSubmit={handleClientLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
               Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
               Password:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="text-red-500 text-xs italic mb-4">{errorMessage}</p>}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>

        
      </div>
    </div>
  )
}