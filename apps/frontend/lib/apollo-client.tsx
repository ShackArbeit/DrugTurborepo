// 'use client'; 
// import { ApolloClient, InMemoryCache, HttpLink} from '@apollo/client'
// import { ApolloProvider } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context'
// import {onError} from '@apollo/client/link/error'
// import React from 'react'

// const httpLink = new HttpLink({
//   uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
//   fetch
// })

// const authLink = setContext((_, { headers }) => {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
//   return {
//     headers: {
//       ...headers,
//       Authorization: token ? `Bearer ${token}` : '', 
//     },
//   }
// })

// const errorLink = onError(({ graphQLErrors})=>{
//      if(typeof window==='undefined') return 
//      const pathname = window.location.pathname
//      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
//      if(graphQLErrors){
//           for(const err of graphQLErrors){
//               if(err.extensions?.code ==='UNAUTHENTICATED' && !isAuthPage){
//                    localStorage.removeItem('token');
//                    document.cookie = 'token=; Max-Age=0; path=/';
//                    window.location.href = '/login';
//                    break
//               }
//           }
//      }
// })

// const client = new ApolloClient({
//   link: errorLink.concat(authLink.concat(httpLink)),
//   cache: new InMemoryCache(),
// })

// export default function ApolloClientProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <ApolloProvider client={client}>
//       {children}
//     </ApolloProvider>
//   )
// }
'use client';

import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
  fetch,
});

const authLink = setContext((_, { headers }) => {
  // 每次請求當下才讀 token（不要在模組頂層讀，避免拿到舊值）
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return {
    headers: {
      ...headers,
      // 大小寫其實不影響，但兩個都設最保險
      Authorization: token ? `Bearer ${token}` : '',
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((e) => {
      // 觀察是不是 401/UNAUTHENTICATED
      console.warn(
        `[GraphQL error] op=${operation.operationName} message=${e.message}`,
        e.extensions
      );
    });
  }
  if (networkError) {
    console.warn('[Network error]', networkError);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
