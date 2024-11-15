'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js'

// Cognito configuration
const poolData = {
  UserPoolId: "us-east-1_dVmG7KZyD",
  ClientId: "q352maej1orc892dd55riiae4"
}

const userPool = new CognitoUserPool(poolData)

// Define a type for the form inputs
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
      onSuccess: (data) => {
        console.log("Sign-in success:", data)
        setIsLoading(false)
        setSuccessMessage('Login successful!')
        // In a real application, you would handle the session and redirect here
        // For demonstration, we'll just show a success message
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

  const fillTestData = () => {
    setInputs({ username: 'Marcel', password: 'Razor@1002' })
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
          <CardDescription>Enter your username and password to login</CardDescription>
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
          <Button onClick={fillTestData} variant="outline" className="w-full mt-4">
            Fill Test Data
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-gray-600 mt-4 w-full">
            Don&apos;t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}