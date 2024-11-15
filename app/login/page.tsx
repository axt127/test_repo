'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js'
import axios from 'axios'
import { useClient } from '../ClientContext'

const poolData = {
  UserPoolId: "us-east-1_dVmG7KZyD",
  ClientId: "q352maej1orc892dd55riiae4"
}

const userPool = new CognitoUserPool(poolData)

type LoginInputs = {
  username: string
  password: string
}

export default function Login() {
  const [inputs, setInputs] = useState<LoginInputs>({ username: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()
  const { setClientName } = useClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const user = new CognitoUser({
      Username: inputs.username,
      Pool: userPool
    })

    const authDetails = new AuthenticationDetails({
      Username: inputs.username,
      Password: inputs.password
    })

    user.authenticateUser(authDetails, {
      onSuccess: async (data) => {
        console.log("Sign-in success:", data)
        setSuccessMessage('Login successful!')
        
        try {
          const response = await axios.get(`https://327kl67ttg.execute-api.us-east-1.amazonaws.com/prod/login?username=${inputs.username}`)
          const userType = response.data
          
          setClientName(userType) // Set the client name in the context
          
          if (userType === 'employee') {
            router.push('/Emp/Homepage')
          } else {
            router.push('/client/HomePage')
          }
        } catch (error) {
          console.error("Error checking user type:", error)
          setErrorMessage("An error occurred while processing your login. Please try again.")
        }
        
        setIsLoading(false)
      },
      onFailure: (err) => {
        console.error("Sign-in error:", err)
        setErrorMessage(err.message || "An error occurred during sign-in.")
        setIsLoading(false)
      },
      newPasswordRequired: (data) => {
        console.log("New password required")
        setErrorMessage("New password required. Please contact support.")
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/wex.png"
              alt="Wex Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                value={inputs.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={inputs.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-300">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}