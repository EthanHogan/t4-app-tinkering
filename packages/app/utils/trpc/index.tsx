import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@t4/api/src/router'

/**
 * A wrapper for your app that provides the TRPC context.
 */
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useAuth } from '@clerk/clerk-expo'

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<AppRouter>()

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL
}

export const TRPCProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { getToken } = useAuth()
  const [queryClient] = React.useState(() => new QueryClient())
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          async headers() {
            const authToken = (await getToken()) as string
            return {
              Authorization: authToken,
            }
          },
          url: `${getBaseUrl()}/trpc`,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
