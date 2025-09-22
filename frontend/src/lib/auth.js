import { betterAuth } from 'better-auth'
// import { drizzleAdapter } from 'better-auth/adapters/drizzle'
// import { db } from '@/db' // your drizzle instance

export const auth = betterAuth({
  // Temporarily disable database for testing
  // database: drizzleAdapter(db, {
  //   provider: 'pg',
  // }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
      scope: ['email', 'profile'],
    },
  },
})
