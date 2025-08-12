'use client'; 
import { ApolloClient, InMemoryCache, HttpLink} from '@apollo/client'
import { ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context'
import React from 'react'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
  fetch
})

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '', // 建議用大寫
    },
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})

export default function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}
