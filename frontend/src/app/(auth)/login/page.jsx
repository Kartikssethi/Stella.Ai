'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { SlimLayout } from '@/components/SlimLayout'
import { authClient } from '@/lib/auth-client'
import { FcGoogle } from 'react-icons/fc'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle OAuth callback
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setError(error === 'OAuthAccountNotLinked' 
        ? 'This email is already in use with a different provider.' 
        : 'Authentication failed. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const { error: loginError } = await authClient.login({
        email,
        password,
      })

      if (loginError) {
        setError(loginError.message || 'Invalid email or password')
        return
      }

      // Redirect to dashboard or home page after successful login
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard'
      })
      
      if (error) {
        setError(error.message || 'Google login failed')
        setIsGoogleLoading(false)
      }
    } catch (err) {
      console.error('Google login error:', err)
      setError('Google login failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Sign in to your account
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Don’t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-rose-600 hover:underline"
        >
          Sign up
        </Link>{' '}
        for a free trial.
      </p>
      <div className="mt-10">
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}
        
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-3"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            'Signing in with Google...'
          ) : (
            <>
              <FcGoogle className="h-5 w-5" />
              Continue with Google
            </>
          )}
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-gray-900">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/register" className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full"
            >
              Create an account
            </Button>
          </Link>
        </div>
      </div>
    </SlimLayout>
  )
}
