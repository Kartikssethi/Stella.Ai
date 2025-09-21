'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { SelectField, TextField } from '@/components/Fields'
import { Logo } from '@/components/Logo'
import { SlimLayout } from '@/components/SlimLayout'
import { authClient } from '@/lib/auth-client'
import { signIn } from '@/lib/auth-client'

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('first_name')
    const lastName = formData.get('last_name')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const { error: signupError } = await authClient.register({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      })

      if (signupError) {
        setError(signupError.message || 'Failed to create account. Please try again.')
        return
      }

      // Auto-login after successful registration
      const { error: loginError } = await authClient.login({
        email,
        password,
      })

      if (loginError) {
        // If auto-login fails, redirect to login page
        router.push('/login')
        return
      }

      // Redirect to dashboard after successful registration and login
      router.push('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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
        Get started for free
      </h2>
      <Button onClick={async () => {
        await signIn.social(
          {
            provider: "google",
            callbackURL: "/",
          },


        );
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"  className='size-3 mr-3'>
          <path
            fill="currentColor"
            d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"
          ></path>
        </svg>
        Continue with Google
      </Button>


    </SlimLayout >
  )
}
