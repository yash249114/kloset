'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReactNode } from 'react'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false // Handled manually or by Next.js router
    })
  }
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}
